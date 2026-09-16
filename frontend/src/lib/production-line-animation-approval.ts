import approval from './production-line-animation-approval.json';
import built from './production-line-animation-revision.json';

// A renderer change invalidates the previous review until that exact version is reviewed again.
export function isProductionLineAnimationApproved(id: string) {
  return (
    approval.revision === built.revision && (approval.approvedLineIds as string[]).includes(id)
  );
}
