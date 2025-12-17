import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

type Provider = "Gmail" | "IMAP" | "POP3";
type Encryption = "SSL/TLS" | "STARTTLS" | "None";
type SyncMode = "manual" | "auto" | "disabled";
type EmailConfigPayload = {
  provider: Provider;
  authorized: boolean;
  protocol: "IMAP" | "POP3";
  server: string;
  port: number | undefined;
  encryption: Encryption;
  username: string;
  syncStartDate: Date;
  fetchAttachments: boolean;
  folders: string[];
  syncMode: SyncMode;
  autoInterval: number;
};
type SavedAccount = { id: string; email: string; provider: Provider; config: EmailConfigPayload };

const EmailConfigInner: React.FC = () => {
  const [provider, setProvider] = useState<Provider>("Gmail");
  const [authorized, setAuthorized] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<"IMAP" | "POP3">("IMAP");
  const [server, setServer] = useState("");
  const [port, setPort] = useState<number | undefined>(undefined);
  const [encryption, setEncryption] = useState<Encryption>("SSL/TLS");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [syncStartDate, setSyncStartDate] = useState<Date>(new Date());
  const [fetchAttachments, setFetchAttachments] = useState(false);
  const [gmailFolderMode, setGmailFolderMode] = useState<"Inbox" | "AllMail" | "Custom">("Inbox");
  const [gmailCustomLabels, setGmailCustomLabels] = useState<string[]>([]);
  const [imapFolders] = useState<string[]>(["INBOX", "Archive", "Sent", "Drafts"]);
  const [imapSelected, setImapSelected] = useState<string[]>([]);
  const [syncMode, setSyncMode] = useState<SyncMode>("manual");
  const [autoInterval, setAutoInterval] = useState<number>(30);
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  
  // New state for Folder Dialog
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("email_accounts");
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) setAccounts(list);
    } catch {}
  }, []);

  useEffect(() => {
    const update = (enc: Encryption, proto: "IMAP" | "POP3") => {
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
    setPort(update(encryption, provider === "POP3" ? "POP3" : protocol));
  }, [encryption, protocol, provider]);

  const handleTestAndSave = async () => {
    // 1. Validate basic connection info
    if (provider === "Gmail" && !authorized) return setTestMsg("请先完成 Gmail 授权");
    if ((provider === "IMAP" || provider === "POP3") && (!server || !port || !username || !password)) return setTestMsg("请完整填写连接信息");

    // 2. Test Connection
    setTesting(true);
    setTestMsg(null);
    await new Promise((r) => setTimeout(r, 600));

    let success = false;
    if (provider === "Gmail") {
       success = authorized;
       if (!success) setTestMsg("未授权");
    } else {
       // Mock connection test
       if (server && port && username && password) {
         success = true;
       } else {
         success = false;
         setTestMsg("连接失败，请检查服务器信息");
       }
    }
    setTesting(false);

    // 3. Open Dialog if successful
    if (success) {
       setTestMsg("连接成功，请确认文件夹配置");
       setIsFolderDialogOpen(true);
    }
  };

  const confirmSave = () => {
    // 4. Validate Folders
    if (provider === "Gmail" && gmailFolderMode === "Custom" && gmailCustomLabels.length === 0) return setTestMsg("请选择至少一个自定义标签");
    if (provider === "IMAP" && imapSelected.length === 0) return setTestMsg("请至少选择一个文件夹");
    
    // 5. Save
    const payload: EmailConfigPayload = {
      provider,
      authorized,
      protocol,
      server,
      port,
      encryption,
      username,
      syncStartDate,
      fetchAttachments,
      folders:
        provider === "Gmail"
          ? gmailFolderMode === "Inbox"
            ? ["Inbox"]
            : gmailFolderMode === "AllMail"
            ? ["All Mail"]
            : gmailCustomLabels
          : provider === "IMAP"
          ? imapSelected
          : ["Inbox"],
      syncMode,
      autoInterval,
    };
    localStorage.setItem("email_config", JSON.stringify(payload));
    setTestMsg("已保存配置");
    setIsFolderDialogOpen(false);
  };

  const setDefaultAccount = (id: string) => {
    localStorage.setItem("activeEmailAccountId", id);
    setTestMsg("已设为默认账户");
  };

  const removeAccount = (id: string) => {
    const next = accounts.filter((a) => a.id !== id);
    setAccounts(next);
    localStorage.setItem("email_accounts", JSON.stringify(next));
    const activeId = localStorage.getItem("activeEmailAccountId");
    if (activeId === id) localStorage.removeItem("activeEmailAccountId");
  };

  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold leading-6">提供商与连接</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>提供商</Label>
            <div className="flex gap-2">
              {(["Gmail", "IMAP", "POP3"] as Provider[]).map((p) => (
                <Button key={p} variant={provider === p ? "default" : "secondary"} onClick={() => setProvider(p)}>
                  {p}
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-500">选择要配置的邮箱提供商。</p>
          </div>

          {provider === "Gmail" && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => { setAuthorized(true); setTestMsg("已授权 Gmail 账户"); }}>连接 Google 账户</Button>
                <Button variant="secondary" onClick={() => { setAuthorized(true); setTestMsg("已重新授权 Gmail 账户"); }}>重新授权</Button>
                <Button variant="destructive" onClick={() => { setAuthorized(false); setTestMsg("已断开 Gmail 授权"); }}>断开授权</Button>
              </div>
              <div className={`rounded px-3 py-2 text-sm ${authorized ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{authorized ? "已授权" : "未授权"}</div>
              {/* Folder selection moved to Dialog */}
            </div>
          )}

          {(provider === "IMAP" || provider === "POP3") && (
            <div className="space-y-6">
              {provider === "IMAP" ? (
                // 1. 移除了协议选择下拉框，默认为 IMAP (由Provider控制)
                <></>
              ) : (
                <div className="space-y-4">
                  <Label>协议</Label>
                  <Input value="POP3" disabled />
                  <p className="text-sm text-gray-500">POP3 仅支持收件箱同步。</p>
                </div>
              )}

              <div className="space-y-4">
                <Label>服务器</Label>
                <Input value={server} onChange={(e) => setServer(e.target.value)} placeholder="imap.example.com" />
                <p className="text-sm text-gray-500">邮箱服务接入地址，例如 imap.example.com。</p>
              </div>

              <div className="space-y-4">
                <Label>加密方式</Label>
                <select className="px-3 py-2 border rounded" value={encryption} onChange={(e) => setEncryption(e.target.value as Encryption)}>
                  <option value="SSL/TLS">SSL/TLS</option>
                  <option value="STARTTLS">STARTTLS</option>
                  <option value="None">不加密</option>
                </select>
                <p className="text-sm text-gray-500">SSL/TLS（安全）或 STARTTLS（升级加密），不加密不推荐。</p>
              </div>

              {encryption === "None" && (
                <div className="text-sm text-amber-700 bg-amber-50 rounded px-3 py-2">不加密连接存在风险，不建议使用。</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>端口</Label>
                  <Input type="number" value={port ?? ""} onChange={(e) => setPort(Number(e.target.value))} placeholder="993/995/143/110" />
                  <p className="text-sm text-gray-500">与加密方式匹配：IMAP 993/143，POP3 995/110。</p>
                </div>
                <div className="space-y-2">
                  <Label>用户名</Label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                  <p className="text-sm text-gray-500">通常为邮箱地址。</p>
                </div>
              </div>

              <div className="space-y-4">
                <Label>密码 / 应用专用密码</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="text-sm text-gray-500">建议使用应用专用密码（开启 2FA 时）。至少 4 位。</p>
              </div>

              {provider === "IMAP" && (
                <div className="space-y-4">
                   <Label>同步文件夹范围</Label>
                   <div 
                     className="border rounded px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                     onClick={() => setIsFolderDialogOpen(true)}
                   >
                     <span>
                       {imapSelected.length > 0 
                         ? `已选择 ${imapSelected.length} 个文件夹` 
                         : "点击选择文件夹"}
                     </span>
                     <Button variant="ghost" size="sm" className="h-6">选择</Button>
                   </div>
                   <p className="text-sm text-gray-500">点击上方选项选择需要同步的文件夹。</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold leading-6">同步规则与范围</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>同步规则</Label>
            <div className="flex gap-2">
              {(["manual", "auto", "disabled"] as SyncMode[]).map((m) => (
                <Button key={m} variant={syncMode === m ? "default" : "secondary"} onClick={() => setSyncMode(m)}>
                  {m === "manual" ? "手动拉取" : m === "auto" ? "定时自动同步" : "关闭同步"}
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-500">手动拉取用于低频；定时自动同步适合持续更新；关闭同步仅保存配置。</p>
          </div>

          {syncMode === "auto" && (
            <div className="space-y-4">
              <Label>同步间隔（分钟）</Label>
              <Input type="number" value={autoInterval} onChange={(e) => setAutoInterval(Number(e.target.value))} />
              <p className="text-sm text-gray-500">建议 15/30/60 分钟，过小间隔可能影响性能与限流。</p>
            </div>
          )}

          <div className="space-y-4">
            <Label>同步起始日期</Label>
            <DateTimePicker value={syncStartDate} onChange={(d) => setSyncStartDate(d!)} showTime={false} placeholder="选择起始日期" className="h-10" />
            <p className="text-sm text-gray-500">从该日期开始同步邮件，不包含更早的邮件。</p>
          </div>

          <div className="space-y-4">
            <Label>同步附件</Label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={fetchAttachments} onChange={(e) => setFetchAttachments(e.target.checked)} />
              启用附件拉取
            </label>
            <p className="text-sm text-gray-500">附件会增加数据量与处理时间。</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button onClick={handleTestAndSave} disabled={testing}>
          {testing ? "测试中..." : "测试并保存"}
        </Button>
      </div>

      {testMsg && (
        <div className={`rounded px-3 py-2 text-sm ${testMsg.includes("成功") || testMsg.includes("已保存") ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{testMsg}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>配置预览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700">提供商：{provider}；授权：{authorized ? "已授权" : "未授权"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold leading-6">已保存的邮箱账户</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts.length === 0 && <div className="text-sm text-gray-500">暂无账户</div>}
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-2 border rounded">
              <div className="text-sm">
                <div className="font-medium">{a.email || `${a.provider} 账户`}</div>
                <div className="text-gray-500">{a.provider}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setDefaultAccount(a.id)}>设为默认</Button>
                <Button size="sm" variant="destructive" onClick={() => removeAccount(a.id)}>删除</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Folder Selection Dialog */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>选择同步文件夹</DialogTitle>
            <DialogDescription>
              请选择需要同步的文件夹或标签。
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
             {provider === "Gmail" && (
                <div className="space-y-4">
                  <Label>文件夹</Label>
                  <div className="flex gap-2">
                    {(["Inbox", "AllMail", "Custom"] as ("Inbox" | "AllMail" | "Custom")[]).map((m) => (
                      <Button key={m} variant={gmailFolderMode === m ? "default" : "secondary"} onClick={() => setGmailFolderMode(m)} size="sm">
                        {m === "Inbox" ? "收件箱" : m === "AllMail" ? "所有邮件" : "自定义标签"}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">选择同步的 Gmail 文件夹或标签。</p>
                  <div className="text-sm text-blue-700 bg-blue-50 rounded px-3 py-2">选择“所有邮件”可能包含大量邮件，拉取耗时较长。</div>
                  {gmailFolderMode === "Custom" && (
                    <div className="space-y-4">
                      <Label>自定义标签</Label>
                      <Input
                        placeholder="输入标签后按回车添加"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const v = (e.target as HTMLInputElement).value.trim();
                            if (v) {
                              setGmailCustomLabels((prev) => [...prev, v]);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                      />
                      {gmailCustomLabels.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {gmailCustomLabels.map((l) => (
                            <span key={l} className="px-2 py-1 text-xs bg-gray-100 rounded">{l}</span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-500">输入需要同步的标签名，如 Important、Work。</p>
                    </div>
                  )}
                </div>
             )}

             {provider === "IMAP" && (
                <div className="space-y-4">
                  <Label>文件夹</Label>
                  <div className="flex flex-wrap gap-2 border p-4 rounded-md">
                    {imapFolders.map((f) => (
                      <label key={f} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={imapSelected.includes(f)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setImapSelected((prev) => (checked ? [...prev, f] : prev.filter((i) => i !== f)));
                          }}
                        />
                        {f}
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">选择需要同步的 IMAP 文件夹。</p>
                </div>
             )}

             {provider === "POP3" && (
                <div className="text-sm text-gray-500">
                  POP3 协议仅支持同步收件箱，无需配置文件夹。
                </div>
             )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>取消</Button>
            <Button onClick={confirmSave}>确认保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailConfigInner;
