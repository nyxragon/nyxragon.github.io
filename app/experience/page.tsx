import { getExperience } from "@/lib/content";
import { PageHeader } from "@/components/ui/Panel";
import { GitTimeline } from "@/components/timeline/GitTimeline";

export const metadata = { title: "Experience" };

export default function ExperiencePage() {
  const experience = getExperience();

  return (
    <div>
      <PageHeader
        title="Experience"
        subtitle="Work history and education."
      />
      <GitTimeline data={experience} />
    </div>
  );
}
