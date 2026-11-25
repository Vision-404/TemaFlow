import { MainLayout } from "@/components/layout/main-layout"
import { MemberList } from "@/components/members/member-list"

export default function MembersPage() {
  return (
    <MainLayout>
      <div className="flex-1 p-8 space-y-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            Manage team members and their access levels.
          </p>
        </div>

        <div className="border rounded-lg">
          <MemberList channelId="demo-channel" currentUserId="user-1" />
        </div>
      </div>
    </MainLayout>
  )
}