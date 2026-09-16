// Production notes remain in the source records; they are not customer-facing captions.
export function CaseCoverCaption({ caption }: { caption: string }) {
  if (!caption || /人工智能生成|AI生成|非客户实物|非本项目工件实拍|AI[- ]generated|not an actual customer workpiece photograph/i.test(caption))
    return null;
  return <figcaption>{caption}</figcaption>;
}
