import { useState } from "react";
import { Comment } from "@shared/types";
import { formatPublishDate } from "@/lib/utils";

interface CommentsContentProps {
  comments: Comment[];
}

export default function CommentsContent({ comments }: CommentsContentProps) {
  const [sortOrder, setSortOrder] = useState<"relevant" | "newest" | "oldest">(
    "relevant",
  );
  const [visibleComments, setVisibleComments] = useState<number>(10);

  const sortedComments = [...comments].sort((a, b) => {
    if (sortOrder === "newest") {
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } else if (sortOrder === "oldest") {
      return (
        new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
      );
    } else {
      // Most relevant - sort by like count
      return b.likeCount - a.likeCount;
    }
  });

  const handleLoadMore = () => {
    setVisibleComments((prev) => prev + 10);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Raw Comments</h3>
        <div className="relative">
          <select
            className="appearance-none bg-youtube-light-grey border border-youtube-border rounded-lg py-2 px-4 pr-8 focus:outline-none focus:border-youtube-blue"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
          >
            <option value="relevant">Most Relevant</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="material-icons text-youtube-dark-grey">
              arrow_drop_down
            </span>
          </span>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {sortedComments.slice(0, visibleComments).map((comment) => (
          <div
            key={comment.id}
            className="border-b border-youtube-border pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 overflow-hidden">
                {comment.authorProfileImageUrl ? (
                  <img
                    src={comment.authorProfileImageUrl}
                    alt={`${comment.authorDisplayName}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-youtube-light-grey">
                    <span className="material-icons text-youtube-dark-grey">
                      person
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <p className="font-medium mr-2">
                    {comment.authorDisplayName}
                  </p>
                  <p className="text-xs text-youtube-dark-grey">
                    {formatPublishDate(comment.publishedAt)}
                  </p>
                </div>
                <p className="text-sm mb-2">{comment.textDisplay}</p>
                <div className="flex items-center text-sm text-youtube-dark-grey">
                  <div className="flex items-center mr-4">
                    <span className="material-icons text-base mr-1">
                      thumb_up
                    </span>
                    {comment.likeCount > 0 ? comment.likeCount : ""}
                  </div>
                  <div className="flex items-center mr-4">
                    <span className="material-icons text-base mr-1">
                      thumb_down
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Comments Button */}
      {visibleComments < sortedComments.length && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            className="text-youtube-blue hover:text-blue-700 font-medium py-2 px-4 border border-youtube-blue rounded-full focus:outline-none transition duration-150"
          >
            Load More Comments
          </button>
        </div>
      )}
    </div>
  );
}
