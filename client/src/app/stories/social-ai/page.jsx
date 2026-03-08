import StoryChapterPage from "@/components/stories/StoryChapterPage";
import { getStoryChapter } from "@/lib/storyChapters";

export default function SocialAiStoryPage() {
  const chapter = getStoryChapter("social-ai");

  return <StoryChapterPage chapter={chapter} />;
}
