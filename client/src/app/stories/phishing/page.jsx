import StoryChapterPage from "@/components/stories/StoryChapterPage";
import { getStoryChapter } from "@/lib/storyChapters";

export default function PhishingStoryPage() {
  const chapter = getStoryChapter("phishing");

  return <StoryChapterPage chapter={chapter} />;
}
