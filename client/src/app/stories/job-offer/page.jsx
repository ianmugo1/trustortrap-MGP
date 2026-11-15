import StoryChapterPage from "@/components/stories/StoryChapterPage";
import { getStoryChapter } from "@/lib/storyChapters";

export default function JobOfferStoryPage() {
  const chapter = getStoryChapter("job-offer");

  return <StoryChapterPage chapter={chapter} />;
}
