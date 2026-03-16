import StoryChapterPage from "@/components/stories/StoryChapterPage";
import { getStoryChapter } from "@/lib/storyChapters";

export default function ScamMixStoryPage() {
  const chapter = getStoryChapter("scam-mix");

  return <StoryChapterPage chapter={chapter} />;
}
