import { VideoData } from "@shared/types";
import { formatViewCount, formatPublishDate } from "@/lib/utils";

interface VideoInfoCardProps {
  video: VideoData;
  commentsAnalyzed?: number;
}

export default function VideoInfoCard({
  video,
  commentsAnalyzed,
}: VideoInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-card mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <div className="aspect-video bg-youtube-light-grey rounded-lg overflow-hidden">
            <img
              src={video.thumbnail}
              alt={`Thumbnail for ${video.title}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="md:w-2/3">
          <h3 className="text-lg font-medium mb-2">{video.title}</h3>
          <div className="flex items-center mb-2 flex-wrap">
            <span className="text-sm font-medium text-youtube-dark-grey">
              {video.channelTitle}
            </span>
            <span className="mx-2 text-youtube-dark-grey">•</span>
            <span className="text-sm text-youtube-dark-grey">
              {formatViewCount(video.viewCount)} views
            </span>
            <span className="mx-2 text-youtube-dark-grey">•</span>
            <span className="text-sm text-youtube-dark-grey">
              {formatPublishDate(video.publishedAt)}
            </span>
          </div>
          <p className="text-sm text-youtube-dark-grey line-clamp-3">
            {video.description}
          </p>
          <div className="mt-3">
            <span className="flex items-center text-sm font-medium">
              <span className="material-icons text-youtube-dark-grey text-base mr-1">
                comment
              </span>
              {commentsAnalyzed} of {video.commentCount} comments analyzed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
