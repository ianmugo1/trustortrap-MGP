import StoryChapterPage from "@/components/stories/StoryChapterPage";
import { getStoryChapter } from "@/lib/storyChapters";

export default function WifiTrapStoryPage() {
  const chapter = getStoryChapter("wifi-trap");

  return <StoryChapterPage chapter={chapter} />;
}
