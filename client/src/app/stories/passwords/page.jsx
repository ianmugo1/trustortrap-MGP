import StoryChapterPage from "@/components/stories/StoryChapterPage";
import { getStoryChapter } from "@/lib/storyChapters";

export default function PasswordStoryPage() {
  const chapter = getStoryChapter("passwords");

  return <StoryChapterPage chapter={chapter} />;
}
