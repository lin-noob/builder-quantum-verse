import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface EmailEditorProps {
  subject?: string;
  setSubject?: (subject: string) => void;
  content: string;
  onContentChange: (content: string) => void;
  attachments: File[];
  onAttachmentsChange: (attachments: File[]) => void;
  height?: string;
  placeholder?: string;
  onSend?: () => void;
  onCancel?: () => void;
}

export default function EmailEditor({
  subject,
  setSubject,
  content,
  onContentChange,
  attachments,
  onAttachmentsChange,
  height = "400px",
  placeholder = "请输入邮件内容...",
  onSend,
  onCancel,
}: EmailEditorProps) {
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onAttachmentsChange([...attachments, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* ReactQuill 编辑器 */}
      <div className="border rounded-md overflow-hidden" style={{ height: `calc(${height} + 50px)` }}>
        <ReactQuill
          value={content}
          onChange={onContentChange}
          theme="snow"
          style={{ height }}
          placeholder={placeholder}
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
              ["link", "image"],
              ["clean"],
            ],
          }}
        />
      </div>

      {/* 附件区域 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">附件</div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 h-8"
            onClick={() => document.getElementById("email-editor-attachment-input")?.click()}
          >
            <Paperclip className="h-3.5 w-3.5" />
            添加附件
          </Button>
          <input
            id="email-editor-attachment-input"
            type="file"
            multiple
            className="hidden"
            onChange={handleAttachmentChange}
          />
        </div>

        {/* 附件列表 */}
        {attachments.length > 0 && (
          <div className="space-y-1.5">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm flex-1 truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">{(file.size / 1024).toFixed(1)} KB</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() => handleRemoveAttachment(index)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
