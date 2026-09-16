# Production R4 source reconciliation

The immutable R4 image was built and accepted before its source had a Git commit. `source-manifest.json` records the original frozen input hashes; `release.json` records the three running image identities. Recording these files does not rebuild, retag or redeploy those images.

This branch reconstructs the public application code from that frozen snapshot. Test expectations now enforce the user-approved withdrawal of standalone case studies and technical guides, including both languages, recommendations and sitemaps. Archived source bodies remain drafts. The protected quench-tank manuscript and delivery directories are outside this branch.

The news search button and the archived continuous-line hero anchor are follow-up fixes. They require a new image and a separate release receipt; the existing R4 image must never be relabelled as containing them.

Private manuscript delivery checks require unpublished review bundles and remain available in the original working directory. They are not part of the portable application CI. Existing application unit, search-submission, backend approval-snapshot and visual checks remain enabled. Historical one-off browser scripts without their reference evidence are also left in that working directory.

Deployment remains paused. PR #71 added pre-sync and direct-script protection. Do not remove the active release markers to restore the old source-sync workflow.
