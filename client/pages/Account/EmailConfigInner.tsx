import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DateTimePicker } from '@/components/ui/date-time-picker'

type Provider = 'Gmail' | 'IMAP' | 'POP3'
type Encryption = 'SSL/TLS' | 'STARTTLS' | 'None'
type SyncMode = 'manual' | 'auto' | 'disabled'

const EmailConfigInner: React.FC = () => {
  const [provider, setProvider] = useState<Provider>('Gmail')
  const [authorized, setAuthorized] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)
  const [protocol, setProtocol] = useState<'IMAP' | 'POP3'>('IMAP')
  const [server, setServer] = useState('')
  const [port, setPort] = useState<number | undefined>(undefined)
  const [encryption, setEncryption] = useState<Encryption>('SSL/TLS')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [syncStartDate, setSyncStartDate] = useState<Date>(new Date())
  const [fetchAttachments, setFetchAttachments] = useState(false)
  const [gmailFolderMode, setGmailFolderMode] = useState<'Inbox' | 'AllMail' | 'Custom'>('Inbox')
  const [gmailCustomLabels, setGmailCustomLabels] = useState<string[]>([])
  const [imapFolders] = useState<string[]>(['INBOX', 'Archive', 'Sent', 'Drafts'])
  const [imapSelected, setImapSelected] = useState<string[]>([])
  const [syncMode, setSyncMode] = useState<SyncMode>('manual')
  const [autoInterval, setAutoInterval] = useState<number>(30)

  useEffect(() => {
    const update = (enc: Encryption, proto: 'IMAP' | 'POP3') => {
      if (proto === 'IMAP') {
        if (enc === 'SSL/TLS') return 993
        if (enc === 'STARTTLS') return 143
        return 143
      } else {
        if (enc === 'SSL/TLS') return 995
        if (enc === 'STARTTLS') return 110
        return 110
      }
    }
    setPort(update(encryption, provider === 'POP3' ? 'POP3' : protocol))
  }, [encryption, protocol, provider])

  const validateAndSave = () => {
    if (provider === 'Gmail' && !authorized) return setTestMsg('请先完成 Gmail 授权')
    if ((provider === 'IMAP' || provider === 'POP3') && (!server || !port || !username || !password))
      return setTestMsg('请完整填写连接信息')
    if (provider === 'Gmail' && gmailFolderMode === 'Custom' && gmailCustomLabels.length === 0)
      return setTestMsg('请选择至少一个自定义标签')
    if (provider === 'IMAP' && imapSelected.length === 0) return setTestMsg('请至少选择一个文件夹')
    const payload = {
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
        provider === 'Gmail'
          ? gmailFolderMode === 'Inbox'
            ? ['Inbox']
            : gmailFolderMode === 'AllMail'
              ? ['All Mail']
              : gmailCustomLabels
          : provider === 'IMAP'
            ? imapSelected
            : ['Inbox'],
      syncMode,
      autoInterval,
    }
    localStorage.setItem('email_config', JSON.stringify(payload))
    setTestMsg('已保存配置')
  }

  const handleTest = async () => {
    setTesting(true)
    setTestMsg(null)
    await new Promise((r) => setTimeout(r, 600))
    if (provider === 'Gmail') setTestMsg(authorized ? '连接成功' : '未授权')
    else setTestMsg(server ? '连接成功' : '请填写服务器地址')
    setTesting(false)
  }

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
              {(['Gmail', 'IMAP', 'POP3'] as Provider[]).map((p) => (
                <Button key={p} variant={provider === p ? 'default' : 'secondary'} onClick={() => setProvider(p)}>
                  {p}
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-500">选择要配置的邮箱提供商。</p>
          </div>

          {provider === 'Gmail' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setAuthorized(true)
                    setTestMsg('已授权 Gmail 账户')
                  }}
                >
                  连接 Google 账户
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setAuthorized(true)
                    setTestMsg('已重新授权 Gmail 账户')
                  }}
                >
                  重新授权
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setAuthorized(false)
                    setTestMsg('已断开 Gmail 授权')
                  }}
                >
                  断开授权
                </Button>
              </div>
              <div
                className={`rounded px-3 py-2 text-sm ${authorized ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}
              >
                {authorized ? '已授权' : '未授权'}
              </div>
              <div className="space-y-4">
                <Label>文件夹</Label>
                <div className="flex gap-2">
                  {(['Inbox', 'AllMail', 'Custom'] as ('Inbox' | 'AllMail' | 'Custom')[]).map((m) => (
                    <Button
                      key={m}
                      variant={gmailFolderMode === m ? 'default' : 'secondary'}
                      onClick={() => setGmailFolderMode(m)}
                    >
                      {m === 'Inbox' ? '收件箱' : m === 'AllMail' ? '所有邮件' : '自定义标签'}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-500">选择同步的 Gmail 文件夹或标签。</p>
                <div className="text-sm text-blue-700 bg-blue-50 rounded px-3 py-2">
                  选择“所有邮件”可能包含大量邮件，拉取耗时较长。
                </div>
                {gmailFolderMode === 'Custom' && (
                  <div className="space-y-4">
                    <Label>自定义标签</Label>
                    <Input
                      placeholder="输入标签后按回车添加"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const v = (e.target as HTMLInputElement).value.trim()
                          if (v) {
                            setGmailCustomLabels((prev) => [...prev, v])
                            ;(e.target as HTMLInputElement).value = ''
                          }
                        }
                      }}
                    />
                    {gmailCustomLabels.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {gmailCustomLabels.map((l) => (
                          <span key={l} className="px-2 py-1 text-xs bg-gray-100 rounded">
                            {l}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-gray-500">输入需要同步的标签名，如 Important、Work。</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(provider === 'IMAP' || provider === 'POP3') && (
            <div className="space-y-6">
              {provider === 'IMAP' ? (
                <div className="space-y-4">
                  <Label>协议</Label>
                  <select
                    className="px-3 py-2 border rounded"
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value as any)}
                  >
                    <option value="IMAP">IMAP</option>
                    <option value="POP3">POP3</option>
                  </select>
                  <p className="text-sm text-gray-500">选择连接协议。IMAP 支持多文件夹同步，POP3 仅收件箱。</p>
                </div>
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
                <select
                  className="px-3 py-2 border rounded"
                  value={encryption}
                  onChange={(e) => setEncryption(e.target.value as Encryption)}
                >
                  <option value="SSL/TLS">SSL/TLS</option>
                  <option value="STARTTLS">STARTTLS</option>
                  <option value="None">不加密</option>
                </select>
                <p className="text-sm text-gray-500">SSL/TLS（安全）或 STARTTLS（升级加密），不加密不推荐。</p>
              </div>

              {encryption === 'None' && (
                <div className="text-sm text-amber-700 bg-amber-50 rounded px-3 py-2">
                  不加密连接存在风险，不建议使用。
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>端口</Label>
                  <Input
                    type="number"
                    value={port ?? ''}
                    onChange={(e) => setPort(Number(e.target.value))}
                    placeholder="993/995/143/110"
                  />
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

              {provider === 'IMAP' && (
                <div className="space-y-4">
                  <Label>文件夹</Label>
                  <div className="flex flex-wrap gap-2">
                    {imapFolders.map((f) => (
                      <label key={f} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={imapSelected.includes(f)}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setImapSelected((prev) => (checked ? [...prev, f] : prev.filter((i) => i !== f)))
                          }}
                        />
                        {f}
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">选择需要同步的 IMAP 文件夹。</p>
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
              {(['manual', 'auto', 'disabled'] as SyncMode[]).map((m) => (
                <Button key={m} variant={syncMode === m ? 'default' : 'secondary'} onClick={() => setSyncMode(m)}>
                  {m === 'manual' ? '手动拉取' : m === 'auto' ? '定时自动同步' : '关闭同步'}
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-500">手动拉取用于低频；定时自动同步适合持续更新；关闭同步仅保存配置。</p>
          </div>

          {syncMode === 'auto' && (
            <div className="space-y-4">
              <Label>同步间隔（分钟）</Label>
              <Input type="number" value={autoInterval} onChange={(e) => setAutoInterval(Number(e.target.value))} />
              <p className="text-sm text-gray-500">建议 15/30/60 分钟，过小间隔可能影响性能与限流。</p>
            </div>
          )}

          <div className="space-y-4">
            <Label>同步起始日期</Label>
            <DateTimePicker
              value={syncStartDate}
              onChange={(d) => setSyncStartDate(d!)}
              showTime={false}
              placeholder="选择起始日期"
              className="h-10"
            />
            <p className="text-sm text-gray-500">从该日期开始同步邮件，不包含更早的邮件。</p>
          </div>

          <div className="space-y-4">
            <Label>同步附件</Label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={fetchAttachments}
                onChange={(e) => setFetchAttachments(e.target.checked)}
              />
              启用附件拉取
            </label>
            <p className="text-sm text-gray-500">附件会增加数据量与处理时间。</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button onClick={handleTest} disabled={testing}>
          {testing ? '测试中...' : '测试连接'}
        </Button>
        <Button onClick={validateAndSave}>保存</Button>
      </div>

      {testMsg && (
        <div
          className={`rounded px-3 py-2 text-sm ${testMsg.includes('成功') || testMsg.includes('已保存') ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}
        >
          {testMsg}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>配置预览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700">
            提供商：
            {provider}
            ；授权：
            {authorized ? '已授权' : '未授权'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailConfigInner
