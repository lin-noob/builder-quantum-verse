# 方案2：FeatureCard风格 - 微妙边框和阴影

```tsx
const CollapsibleSection = ({ title, isOpen, onToggle, children }: CollapsibleSectionProps) => (
  <Collapsible open={isOpen} onOpenChange={onToggle}>
    <CollapsibleTrigger asChild>
      <div className="w-full p-3 -m-3 rounded-lg border border-transparent hover:border-primary/20 hover:bg-muted/30 hover:shadow-sm transition-all duration-300 cursor-pointer">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium">{title}</span>
          <ChevronRight className="h-5 w-5 shrink-0 transition-transform duration-200 data-[state=open]:rotate-90" />
        </div>
      </div>
    </CollapsibleTrigger>
    <CollapsibleContent className="mt-4">
      {children}
    </CollapsibleContent>
  </Collapsible>
);
```

特点：
- 整个区域有边框和背景变化
- 微妙的阴影效果
- 更明显的可点击区域
