import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
  thumbnail: string;
  viewCount: number;
  commentsAnalyzed: number;
  totalComments: number;
  analysisDate: string;
}

// Sorting options
type SortField = 'analysisDate' | 'publishedAt' | 'viewCount' | 'commentsAnalyzed' | 'totalComments';
type SortDirection = 'asc' | 'desc';

export default function VideosList() {
  const [sortField, setSortField] = useState<SortField>('analysisDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Fetch all analyzed videos using a mutation instead of a query to use POST method
  const [videos, setVideos] = useState<AnalyzedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  // Load videos when component mounts
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await fetch('/api/youtube/videos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch analyzed videos');
        }
        
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching analyzed videos:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideos();
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
            comparison = a.viewCount - b.viewCount;
            break;
          case 'commentsAnalyzed':
            comparison = a.commentsAnalyzed - b.commentsAnalyzed;
            break;
          case 'totalComments':
            comparison = (a.totalComments || 0) - (b.totalComments || 0);
            break;
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      })
    : [];

  return (
    <div className="min-h-screen flex flex-col">      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Card className="w-full shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Analyzed Videos</CardTitle>
            <CardDescription>
              A list of all YouTube videos that have been analyzed by our platform.
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
                <Link href="/">
                  <Button className="mt-4">Analyze Your First Video</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>List of all previously analyzed YouTube videos.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[550px]">Video Title</TableHead>
                      <TableHead className="w-[200px]">Channel Name</TableHead>
                      <TableHead className="w-[150px]">
                        <button 
                          className="flex items-center space-x-1 focus:outline-none"
                          onClick={() => handleSort('publishedAt')}
                        >
                          <span>Published</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className="w-[150px]">
                        <button 
                          className="flex items-center space-x-1 focus:outline-none"
                          onClick={() => handleSort('viewCount')}
                        >
                          <span>Video Views</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className="w-[200px]">
                        <button 
                          className="flex items-center space-x-1 focus:outline-none"
                          onClick={() => handleSort('commentsAnalyzed')}
                        >
                          <span>Comments Analyzed</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className="w-[200px]">
                        <button 
                          className="flex items-center space-x-1 focus:outline-none"
                          onClick={() => handleSort('totalComments')}
                        >
                          <span>Total Comments</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className="w-[150px]">
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
                            <span className="truncate max-w-[450px]" title={video.title}>
                              {video.title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{video.channelTitle}</TableCell>
                        <TableCell>{formatPublishDate(video.publishedAt)}</TableCell>
                        <TableCell>{formatViewCount(video.viewCount)}</TableCell>
                        <TableCell>{video.commentsAnalyzed}</TableCell>
                        <TableCell>{video.totalComments.toLocaleString()}</TableCell>
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
                            <Link 
                              href={`/?videoId=${video.videoId}`}
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                              title="View Analysis"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
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
      </main>
    </div>
  );
}