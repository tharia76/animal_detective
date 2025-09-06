interface PerformanceMetrics {
  loadTime: number;
  playTime: number;
  bufferTime: number;
  frameDrops: number;
  errors: string[];
  memoryUsage?: number;
}

interface VideoPerformanceData {
  [videoId: string]: PerformanceMetrics;
}

class VideoPerformanceMonitor {
  private metrics: VideoPerformanceData = {};
  private startTimes: { [videoId: string]: number } = {};
  private frameDropCount: { [videoId: string]: number } = {};

  /**
   * Start monitoring a video
   */
  startMonitoring(videoId: string): void {
    this.startTimes[videoId] = Date.now();
    this.frameDropCount[videoId] = 0;
    
    this.metrics[videoId] = {
      loadTime: 0,
      playTime: 0,
      bufferTime: 0,
      frameDrops: 0,
      errors: [],
    };

    console.log(`🎬 Started monitoring video: ${videoId}`);
  }

  /**
   * Record video load completion
   */
  recordLoadComplete(videoId: string): void {
    if (this.startTimes[videoId]) {
      const loadTime = Date.now() - this.startTimes[videoId];
      this.metrics[videoId].loadTime = loadTime;
      console.log(`🎬 Video ${videoId} loaded in ${loadTime}ms`);
    }
  }

  /**
   * Record video play start
   */
  recordPlayStart(videoId: string): void {
    if (this.startTimes[videoId]) {
      const playTime = Date.now() - this.startTimes[videoId];
      this.metrics[videoId].playTime = playTime;
      console.log(`🎬 Video ${videoId} started playing in ${playTime}ms`);
    }
  }

  /**
   * Record buffer event
   */
  recordBufferEvent(videoId: string, bufferTime: number): void {
    this.metrics[videoId].bufferTime += bufferTime;
    console.log(`🎬 Video ${videoId} buffered for ${bufferTime}ms`);
  }

  /**
   * Record frame drop
   */
  recordFrameDrop(videoId: string): void {
    this.frameDropCount[videoId] = (this.frameDropCount[videoId] || 0) + 1;
    this.metrics[videoId].frameDrops = this.frameDropCount[videoId];
  }

  /**
   * Record error
   */
  recordError(videoId: string, error: string): void {
    this.metrics[videoId].errors.push(error);
    console.error(`🎬 Video ${videoId} error:`, error);
  }

  /**
   * Record memory usage (if available)
   */
  recordMemoryUsage(videoId: string, memoryUsage: number): void {
    this.metrics[videoId].memoryUsage = memoryUsage;
  }

  /**
   * Get performance metrics for a video
   */
  getMetrics(videoId: string): PerformanceMetrics | null {
    return this.metrics[videoId] || null;
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): VideoPerformanceData {
    return { ...this.metrics };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalVideos: number;
    averageLoadTime: number;
    averagePlayTime: number;
    totalFrameDrops: number;
    totalErrors: number;
    performanceScore: number;
  } {
    const videos = Object.values(this.metrics);
    const totalVideos = videos.length;

    if (totalVideos === 0) {
      return {
        totalVideos: 0,
        averageLoadTime: 0,
        averagePlayTime: 0,
        totalFrameDrops: 0,
        totalErrors: 0,
        performanceScore: 100,
      };
    }

    const averageLoadTime = videos.reduce((sum, video) => sum + video.loadTime, 0) / totalVideos;
    const averagePlayTime = videos.reduce((sum, video) => sum + video.playTime, 0) / totalVideos;
    const totalFrameDrops = videos.reduce((sum, video) => sum + video.frameDrops, 0);
    const totalErrors = videos.reduce((sum, video) => sum + video.errors.length, 0);

    // Calculate performance score (0-100)
    let performanceScore = 100;
    
    // Deduct points for slow loading (>2 seconds)
    if (averageLoadTime > 2000) {
      performanceScore -= Math.min(30, (averageLoadTime - 2000) / 100);
    }
    
    // Deduct points for slow play start (>3 seconds)
    if (averagePlayTime > 3000) {
      performanceScore -= Math.min(30, (averagePlayTime - 3000) / 100);
    }
    
    // Deduct points for frame drops
    performanceScore -= Math.min(20, totalFrameDrops * 2);
    
    // Deduct points for errors
    performanceScore -= Math.min(20, totalErrors * 5);

    return {
      totalVideos,
      averageLoadTime: Math.round(averageLoadTime),
      averagePlayTime: Math.round(averagePlayTime),
      totalFrameDrops,
      totalErrors,
      performanceScore: Math.max(0, Math.round(performanceScore)),
    };
  }

  /**
   * Clear metrics for a specific video
   */
  clearVideoMetrics(videoId: string): void {
    delete this.metrics[videoId];
    delete this.startTimes[videoId];
    delete this.frameDropCount[videoId];
  }

  /**
   * Clear all metrics
   */
  clearAllMetrics(): void {
    this.metrics = {};
    this.startTimes = {};
    this.frameDropCount = {};
  }

  /**
   * Log performance report
   */
  logPerformanceReport(): void {
    const summary = this.getPerformanceSummary();
    
    console.log('\n🎬 VIDEO PERFORMANCE REPORT');
    console.log('============================');
    console.log(`Total videos monitored: ${summary.totalVideos}`);
    console.log(`Average load time: ${summary.averageLoadTime}ms`);
    console.log(`Average play time: ${summary.averagePlayTime}ms`);
    console.log(`Total frame drops: ${summary.totalFrameDrops}`);
    console.log(`Total errors: ${summary.totalErrors}`);
    console.log(`Performance score: ${summary.performanceScore}/100`);
    
    if (summary.performanceScore < 70) {
      console.warn('⚠️  Performance issues detected! Consider optimizing videos.');
    } else if (summary.performanceScore >= 90) {
      console.log('✅ Excellent video performance!');
    } else {
      console.log('✅ Good video performance.');
    }
  }
}

// Export singleton instance
export const videoPerformanceMonitor = new VideoPerformanceMonitor();

// Export class for testing
export { VideoPerformanceMonitor };
