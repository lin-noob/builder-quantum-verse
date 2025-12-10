import React, { useMemo, useState } from "react";
import { Button, Card, Form, Input, Radio, Select, DatePicker, Switch, Alert, Space, Typography, Tree, message } from "antd";
import dayjs from "dayjs";

type Provider = "Gmail" | "IMAP" | "POP3";
type Encryption = "SSL/TLS" | "STARTTLS" | "None";

const { Title, Paragraph } = Typography;

const EmailConfigPage: React.FC = () => {
  const [form] = Form.useForm();
  const [provider, setProvider] = useState<Provider>("Gmail");
  const [authorized, setAuthorized] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [imapFolders, setImapFolders] = useState<any[]>([]);
  const [imapCheckedKeys, setImapCheckedKeys] = useState<React.Key[]>([]);

  const initialValues = useMemo(
    () => ({
      provider: "Gmail",
      protocol: "IMAP",
      server: "",
      port: undefined,
      encryption: "SSL/TLS",
      username: "",
      password: "",
      syncStartDate: dayjs(),
      gmailFolderMode: "Inbox",
      gmailCustomLabels: [],
      fetchAttachments: false,
    }),
    [],
  );

  const updatePortByEncryption = (enc: Encryption, proto: "IMAP" | "POP3") => {
    if (proto === "IMAP") {
      if (enc === "SSL/TLS") return 993;
      if (enc === "STARTTLS") return 143;
      return 143;
    } else {
      if (enc === "SSL/TLS") return 995;
      if (enc === "STARTTLS") return 110;
      return 110;
    }
  };

  const onProviderChange = (e: any) => {
    const p = e.target.value as Provider;
    setProvider(p);
    setTestResult(null);
    if (p === "POP3") {
      form.setFieldsValue({ protocol: "POP3" });
    } else if (p === "IMAP") {
      form.setFieldsValue({ protocol: "IMAP" });
    }
  };

  const onEncryptionChange = (value: Encryption) => {
    const proto = form.getFieldValue("protocol") || (provider === "POP3" ? "POP3" : "IMAP");
    const port = updatePortByEncryption(value, proto);
    form.setFieldsValue({ port });
  };

  const onProtocolChange = (value: "IMAP" | "POP3") => {
    const enc = form.getFieldValue("encryption") || "SSL/TLS";
    const port = updatePortByEncryption(enc, value);
    form.setFieldsValue({ port });
  };

  const handleAuthorizeGmail = () => {
    setAuthorized(true);
    message.success("已授权 Gmail 账户");
  };

  const handleReconnectGmail = () => {
    setAuthorized(true);
    message.success("已重新授权 Gmail 账户");
  };

  const handleDisconnectGmail = () => {
    setAuthorized(false);
    message.info("已断开 Gmail 授权");
  };

  const handleLoadImapFolders = () => {
    const data = [
      { title: "INBOX", key: "INBOX" },
      { title: "Archive", key: "Archive" },
      { title: "Sent", key: "Sent" },
      { title: "Drafts", key: "Drafts" },
    ];
    setImapFolders(data);
    message.success("已加载文件夹");
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 800));
    const srv = form.getFieldValue("server");
    if (provider === "Gmail") {
      if (authorized) {
        setTestResult({ ok: true, msg: "连接成功" });
      } else {
        setTestResult({ ok: false, msg: "未授权" });
      }
    } else {
      if (srv) {
        setTestResult({ ok: true, msg: "连接成功" });
      } else {
        setTestResult({ ok: false, msg: "请填写服务器地址" });
      }
    }
    setTesting(false);
  };

  const validateBeforeSave = async () => {
    const values = await form.validateFields();
    if (provider === "Gmail" && !authorized) {
      message.error("请先完成 Gmail 授权");
      throw new Error("unauthorized");
    }
    if (provider === "Gmail") {
      const mode = values.gmailFolderMode;
      if (mode === "Custom" && (!values.gmailCustomLabels || values.gmailCustomLabels.length === 0)) {
        message.error("请选择至少一个自定义标签");
        throw new Error("no labels");
      }
    }
    if (provider === "IMAP") {
      if (imapCheckedKeys.length === 0) {
        message.error("请至少选择一个文件夹");
        throw new Error("no folders");
      }
    }
    if (provider === "POP3") {
      /* fixed inbox */
    }
    return values;
  };

  const handleSave = async () => {
    try {
      const values = await validateBeforeSave();
      const payload = {
        provider,
        authorized,
        protocol: values.protocol,
        server: values.server,
        port: values.port,
        encryption: values.encryption,
        username: values.username,
        syncStartDate: values.syncStartDate?.toISOString?.() || values.syncStartDate,
        fetchAttachments: values.fetchAttachments || false,
        folders:
          provider === "Gmail"
            ? values.gmailFolderMode === "Inbox"
              ? ["Inbox"]
              : values.gmailFolderMode === "AllMail"
              ? ["All Mail"]
              : values.gmailCustomLabels || []
            : provider === "IMAP"
            ? imapCheckedKeys
            : ["Inbox"],
      };
      localStorage.setItem("email_config", JSON.stringify(payload));
      message.success("已保存配置");
    } catch {}
  };

  return (
    <div className="p-4">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Title level={4}>邮箱配置</Title>
        </div>

        <Card>
          <Form form={form} layout="vertical" initialValues={initialValues}>
            <Form.Item label="提供商" name="provider" rules={[{ required: true }]}> 
              <Radio.Group onChange={onProviderChange}>
                <Radio.Button value="Gmail">Gmail</Radio.Button>
                <Radio.Button value="IMAP">IMAP</Radio.Button>
                <Radio.Button value="POP3">POP3</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="同步规则" name="syncMode" initialValue={"manual"} extra="手动拉取用于低频；定时自动同步适合持续更新；关闭同步仅保存配置。">
              <Radio.Group>
                <Radio value="manual">手动拉取</Radio>
                <Radio value="auto">定时自动同步</Radio>
                <Radio value="disabled">关闭同步</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.syncMode !== cur.syncMode}>
              {({ getFieldValue }) =>
                getFieldValue("syncMode") === "auto" ? (
                  <Form.Item label="同步间隔（分钟）" name="autoInterval" initialValue={30} extra="建议 15/30/60 分钟，过小间隔可能影响性能与限流。">
                    <Input type="number" />
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            {provider === "Gmail" && (
              <Card bordered={false} style={{ background: "#fafafa" }}>
                <Space wrap>
                  <Button type="primary" onClick={handleAuthorizeGmail} disabled={authorized}>连接 Google 账户</Button>
                  <Button onClick={handleReconnectGmail}>重新授权</Button>
                  <Button danger onClick={handleDisconnectGmail}>断开授权</Button>
                  <Alert type={authorized ? "success" : "warning"} message={authorized ? "已授权" : "未授权"} showIcon />
                </Space>
                <Form.Item label="文件夹" name="gmailFolderMode" style={{ marginTop: 16 }} extra="选择同步的 Gmail 文件夹或标签。">
                  <Radio.Group>
                    <Radio value="Inbox">收件箱</Radio>
                    <Radio value="AllMail">所有邮件</Radio>
                    <Radio value="Custom">自定义标签</Radio>
                  </Radio.Group>
                </Form.Item>
                <Alert style={{ marginBottom: 12 }} type="info" message="选择“所有邮件”可能包含大量邮件，拉取耗时较长" showIcon />
                <Form.Item name="gmailCustomLabels" label="自定义标签" extra="输入需要同步的标签名，如 Important、Work。">
                  <Select mode="tags" placeholder="输入或选择标签" options={[{ label: "Important", value: "Important" }, { label: "Work", value: "Work" }]} />
                </Form.Item>
              </Card>
            )}

            {(provider === "IMAP" || provider === "POP3") && (
              <Card bordered={false} style={{ background: "#fafafa" }}>
                {provider === "IMAP" && (
                <Form.Item label="协议" name="protocol" rules={[{ required: true }]} extra="选择连接协议。IMAP 支持多文件夹同步，POP3 仅收件箱。"> 
                  <Select onChange={onProtocolChange} options={[{ label: "IMAP", value: "IMAP" }, { label: "POP3", value: "POP3" }]} />
                </Form.Item>
                )}
                {provider === "POP3" && (
                  <Form.Item label="协议" name="protocol">
                    <Input value="POP3" disabled />
                  </Form.Item>
                )}
                <Form.Item label="服务器" name="server" rules={[{ required: true, message: "请输入服务器地址" }]} extra="邮箱服务接入地址，例如 imap.example.com。"> 
                  <Input placeholder="imap.example.com" />
                </Form.Item>
                <Form.Item label="加密方式" name="encryption" rules={[{ required: true }]} extra="SSL/TLS（安全）或 STARTTLS（升级加密），不加密不推荐。"> 
                  <Select onChange={onEncryptionChange} options={[{ label: "SSL/TLS", value: "SSL/TLS" }, { label: "STARTTLS", value: "STARTTLS" }, { label: "不加密", value: "None" }]} />
                </Form.Item>
                <Form.Item label="端口" name="port" rules={[{ required: true, message: "请输入端口" }]} extra="与加密方式匹配：IMAP 993/143，POP3 995/110。"> 
                  <Input type="number" placeholder="993/995/143/110" />
                </Form.Item>
                <Form.Item label="用户名" name="username" rules={[{ required: true, message: "请输入用户名" }]} extra="通常为邮箱地址。"> 
                  <Input />
                </Form.Item>
                <Form.Item label="密码 / 应用专用密码" name="password" rules={[{ required: true, message: "请输入密码" }, { min: 4, message: "至少 4 位" }]} extra="建议使用应用专用密码（开启 2FA 时）。"> 
                  <Input.Password />
                </Form.Item>

                {form.getFieldValue("encryption") === "None" && (
                  <Alert type="warning" message="不加密连接存在风险，不建议使用" showIcon />
                )}

                {provider === "IMAP" && (
                  <div style={{ marginTop: 16 }}>
                    <Space>
                      <Button onClick={handleLoadImapFolders}>加载文件夹</Button>
                    </Space>
                    <div style={{ marginTop: 8 }}>
                      <Tree
                        checkable
                        treeData={imapFolders}
                        checkedKeys={imapCheckedKeys}
                        onCheck={(keys) => setImapCheckedKeys(keys as React.Key[])}
                      />
                    </div>
                    <Alert style={{ marginTop: 8 }} type="info" message="选择需要同步的 IMAP 文件夹。" showIcon />
                  </div>
                )}
              </Card>
            )}

            <Card bordered={false} style={{ background: "#fafafa" }}>
              <Form.Item label="同步起始日期" name="syncStartDate" rules={[{ required: true, message: "请选择日期" }]} extra="从该日期开始同步邮件，不包含更早的邮件。"> 
                <DatePicker style={{ width: 240 }} disabledDate={(d) => d.isAfter(dayjs())} />
              </Form.Item>
              <Form.Item label="同步附件" name="fetchAttachments" valuePropName="checked" extra="附件会增加数据量与处理时间。"> 
                <Switch />
              </Form.Item>
            </Card>

            <Space style={{ marginTop: 16 }} wrap>
              <Button onClick={handleTestConnection} loading={testing}>测试连接</Button>
              <Button type="primary" onClick={handleSave}>保存</Button>
            </Space>

            {testResult && (
              <div style={{ marginTop: 12 }}>
                <Alert type={testResult.ok ? "success" : "error"} message={testResult.ok ? "连接成功" : `连接失败：${testResult.msg}`} showIcon />
              </div>
            )}
          </Form>
        </Card>

        <Card>
          <Title level={5}>配置预览</Title>
          <Paragraph>
            提供商：{provider}；授权：{authorized ? "已授权" : "未授权"}
          </Paragraph>
        </Card>
      </Space>
    </div>
  );
};

export default EmailConfigPage;
