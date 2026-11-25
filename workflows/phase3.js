export const meta = {
  name: 'phase-3-organizations',
  description: 'Implement organization selection, management, and workspace switching UI',
  phases: [
    { title: 'Create Components', detail: 'Build OrganizationProvider and WorkspaceSettings UI' },
    { title: 'Verify', detail: 'Check TypeScript compilation' }
  ],
}

phase('Create Components')
const result = await agent('Implement the organization management context and UI components for TeamFlow', {
  label: 'build-org-components',
  phase: 'Create Components',
  agentType: 'general-purpose'
})

phase('Verify')
const verify = await agent('Verify TypeScript compilation and test build', {
  label: 'verify-build',
  phase: 'Verify',
  agentType: 'general-purpose'
})

return { result, verify }
