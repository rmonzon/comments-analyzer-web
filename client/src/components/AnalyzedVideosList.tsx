import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPublishDate, formatViewCount } from '@/lib/utils';
import { ExternalLink, Eye, ArrowUpDown } from 'lucide-react';

// Type for analyzed videos from API
interface AnalyzedVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string | null;
  viewCount: number | null;
  commentsAnalyzed: number;
  analysisDate: string;
}

// Sorting options
type SortField = 'analysisDate' | 'publishedAt' | 'viewCount' | 'commentsAnalyzed';
type SortDirection = 'asc' | 'desc';

export default function AnalyzedVideosList() {
  const [sortField, setSortField] = useState<SortField>('analysisDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [videos, setVideos] = useState<AnalyzedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  // Load videos when component mounts
  useEffect(() => {
    async function fetchAllAnalyzedVideos() {
      try {
        setIsLoading(true);
        
        // Step 1: Get all analyses from the database
        const analyses = await fetch('/api/youtube/analyses')
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch analyses: ${response.status}`);
            }
            // Make sure the response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error('Expected JSON response but got: ' + contentType);
            }
            return response.json();
          });
        
        console.log('Fetched analyses from DB:', analyses);
        
        if (!analyses || analyses.length === 0) {
          console.log('No analyses found in database.');
          setVideos([]);
          setIsLoading(false);
          return;
        }
        
        // Step 2: For each analysis, get the video details
        const analyzedVideos: AnalyzedVideo[] = [];
        
        for (const analysis of analyses) {
          try {
            // Fetch video details from API
            const videoResponse = await fetch(`/api/youtube/video?id=${analysis.videoId}`);
            if (videoResponse.ok) {
              const videoData = await videoResponse.json();
              
              analyzedVideos.push({
                videoId: analysis.videoId,
                title: videoData.title || 'Unknown Video',
                channelTitle: videoData.channelTitle || 'Unknown Channel',
                publishedAt: videoData.publishedAt || new Date().toISOString(),
                thumbnail: videoData.thumbnail || `https://i.ytimg.com/vi/${analysis.videoId}/hqdefault.jpg`,
                viewCount: videoData.viewCount || 0,
                commentsAnalyzed: analysis.commentsAnalyzed || 0,
                analysisDate: analysis.createdAt || new Date().toISOString()
              });
            } else {
              // If we can't get video details, create a partial entry with what we know
              console.warn(`Failed to fetch video data for ${analysis.videoId}`);
              analyzedVideos.push({
                videoId: analysis.videoId,
                title: `Video ${analysis.videoId}`,
                channelTitle: 'Unknown Channel',
                publishedAt: analysis.createdAt,
                thumbnail: `https://i.ytimg.com/vi/${analysis.videoId}/hqdefault.jpg`, 
                viewCount: 0,
                commentsAnalyzed: analysis.commentsAnalyzed || 0,
                analysisDate: analysis.createdAt || new Date().toISOString()
              });
            }
          } catch (err) {
            console.error(`Error fetching video data for ${analysis.videoId}:`, err);
          }
        }
        
        console.log('Processed analyzed videos:', analyzedVideos);
        setVideos(analyzedVideos);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading analyzed videos:', error);
        setIsError(true);
        setIsLoading(false);
      }
    }
    
    fetchAllAnalyzedVideos();
  }, []);

  // Function to handle sort changes
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field is clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort the videos based on current sort settings
  const sortedVideos = videos 
    ? [...videos].sort((a, b) => {
        let comparison = 0;
        
        switch (sortField) {
          case 'analysisDate':
            comparison = new Date(a.analysisDate).getTime() - new Date(b.analysisDate).getTime();
            break;
          case 'publishedAt':
            comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
            break;
          case 'viewCount':
            comparison = (a.viewCount || 0) - (b.viewCount || 0);
            break;
          case 'commentsAnalyzed':
            comparison = a.commentsAnalyzed - b.commentsAnalyzed;
            break;
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      })
    : [];

  return (
    <div className="mt-8 mb-8">
      <Card className="w-full shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Analyzed Videos</CardTitle>
          <CardDescription>
            A list of YouTube videos that have been analyzed by our AI.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading analyzed videos. Please try again later.</p>
            </div>
          ) : sortedVideos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No videos have been analyzed yet.</p>
              <Button 
                className="mt-4"
                onClick={() => {
                  // Go back to home page
                  window.location.href = '/';
                }}
              >
                Analyze Your First Video
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>List of all analyzed YouTube videos.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Video</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead className="w-[100px]">
                      <button 
                        className="flex items-center space-x-1 focus:outline-none"
                        onClick={() => handleSort('publishedAt')}
                      >
                        <span>Published</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center space-x-1 focus:outline-none"
                        onClick={() => handleSort('viewCount')}
                      >
                        <span>Views</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center space-x-1 focus:outline-none"
                        onClick={() => handleSort('commentsAnalyzed')}
                      >
                        <span>Comments Analyzed</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center space-x-1 focus:outline-none"
                        onClick={() => handleSort('analysisDate')}
                      >
                        <span>Analysis Date</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedVideos.map((video) => (
                    <TableRow key={video.videoId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-16 h-9 overflow-hidden rounded">
                            <img 
                              src={video.thumbnail || 'https://placehold.co/120x68?text=No+Thumbnail'} 
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="truncate max-w-[180px]" title={video.title}>
                            {video.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{video.channelTitle}</TableCell>
                      <TableCell>{formatPublishDate(video.publishedAt)}</TableCell>
                      <TableCell>{formatViewCount(video.viewCount || 0)}</TableCell>
                      <TableCell>{video.commentsAnalyzed}</TableCell>
                      <TableCell>{formatPublishDate(video.analysisDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <a 
                            href={`https://www.youtube.com/watch?v=${video.videoId}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            title="Watch on YouTube"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                          <a 
                            href={`/?videoId=${video.videoId}`}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="View Analysis"
                          >
                            <Eye className="h-5 w-5" />
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}