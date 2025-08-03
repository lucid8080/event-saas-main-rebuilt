# R2 Monitoring, Optimization & Analytics Guide

## Overview

This guide covers the comprehensive monitoring, optimization, and analytics system implemented for Cloudflare R2 integration. The system provides real-time insights into R2 usage, performance metrics, access patterns, and cost optimization recommendations.

## 🎯 Features Implemented

### 1. Usage Tracking & Monitoring
- **Real-time R2 usage statistics**
- **Storage consumption tracking**
- **Image upload/download metrics**
- **User activity patterns**
- **Event type distribution analysis**

### 2. Performance Optimization
- **In-memory caching for signed URLs**
- **Performance tracking for all R2 operations**
- **Upload success rate monitoring**
- **Response time analysis**
- **Cache hit rate optimization**

### 3. Analytics Dashboard
- **Comprehensive admin dashboard**
- **Interactive charts and visualizations**
- **Cost estimation and projections**
- **System health monitoring**
- **Automated recommendations**

### 4. Access Pattern Analysis
- **Image access frequency tracking**
- **User behavior analysis**
- **Peak usage time identification**
- **Most accessed content insights**

## 📊 Database Schema

### Analytics Tables

#### `ImageAccessLog`
Tracks user interactions with images:
```sql
CREATE TABLE image_access_logs (
  id VARCHAR(191) PRIMARY KEY,
  imageId VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  accessType VARCHAR(191) NOT NULL, -- 'gallery', 'modal', 'download', 'share'
  accessCount INT DEFAULT 1,
  lastAccessed DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  
  UNIQUE(imageId, userId, accessType),
  INDEX(imageId),
  INDEX(userId),
  INDEX(lastAccessed)
);
```

#### `R2PerformanceLog`
Tracks R2 operation performance:
```sql
CREATE TABLE r2_performance_logs (
  id VARCHAR(191) PRIMARY KEY,
  operation VARCHAR(191) NOT NULL, -- 'upload', 'download', 'signed_url', 'delete'
  success BOOLEAN NOT NULL,
  duration INT NOT NULL, -- Duration in milliseconds
  error TEXT,
  timestamp DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  
  INDEX(operation),
  INDEX(success),
  INDEX(timestamp)
);
```

## 🔧 Core Components

### 1. Analytics Engine (`lib/r2-analytics.ts`)

#### Key Functions:
- `getR2UsageStats()` - Comprehensive usage statistics
- `getR2PerformanceStats()` - Performance metrics
- `getImageAccessPatterns()` - Access pattern analysis
- `trackImageAccess()` - Real-time access tracking
- `trackR2Operation()` - Performance monitoring

#### Usage Statistics Include:
- Total images vs R2 images
- Storage consumption (GB)
- Estimated monthly costs
- Images by event type
- Top users by image count

#### Performance Metrics Include:
- Upload success rate
- Average upload time
- Signed URL generation count
- Cache hit rate
- Operation failure tracking

### 2. Caching System (`lib/r2-cache.ts`)

#### Features:
- **In-memory caching** for signed URLs
- **Automatic cleanup** of expired entries
- **Cache statistics** and monitoring
- **Fallback mechanism** for cache failures
- **Batch URL generation** for performance

#### Cache Configuration:
- **Cache Duration**: 50 minutes (10 minutes less than signed URL expiry)
- **Cleanup Interval**: Every 5 minutes
- **Memory Management**: Automatic expiration handling

### 3. Enhanced R2 Utilities (`lib/r2.ts`)

#### Performance Tracking:
All R2 operations now include:
- **Operation timing** (start/end timestamps)
- **Success/failure tracking**
- **Error logging** with detailed messages
- **Performance metrics** storage

#### Tracked Operations:
- `uploadImageToR2()` - Image uploads
- `generateSignedUrl()` - URL generation
- `deleteImageFromR2()` - Image deletion

### 4. Gallery Integration (`lib/gallery-utils.ts`)

#### Enhanced Features:
- **Access pattern tracking** for all image views
- **Cached signed URL** generation
- **Performance optimization** with batch processing
- **User behavior analysis**

## 📈 Analytics Dashboard

### API Endpoint: `/api/analytics/r2-dashboard`

#### Response Structure:
```json
{
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "r2Connection": true,
  
  "usage": {
    "totalImages": 1000,
    "r2Images": 750,
    "r2Percentage": 75,
    "storageGB": 1.5,
    "estimatedMonthlyStorageCost": 0.023,
    "estimatedMonthlyOperationCost": 0.045,
    "estimatedTotalMonthlyCost": 0.068
  },
  
  "performance": {
    "uploadSuccessRate": 98,
    "uploadFailures": 5,
    "averageUploadTime": 1200,
    "signedUrlGenerationCount": 2500,
    "signedUrlFailures": 2,
    "cacheHitRate": 85
  },
  
  "accessPatterns": {
    "totalAccesses": 5000,
    "uniqueImagesAccessed": 400,
    "averageAccessesPerImage": 12.5,
    "mostAccessedImages": [...]
  },
  
  "cache": {
    "size": 150,
    "activeEntries": 145
  },
  
  "systemHealth": {
    "r2Connection": "healthy",
    "cacheStatus": "active",
    "performanceStatus": "excellent"
  },
  
  "recommendations": [
    "Consider implementing image compression for large files",
    "Cache hit rate is excellent, consider extending cache duration"
  ]
}
```

### React Component: `components/admin/r2-analytics-dashboard.tsx`

#### Features:
- **Real-time data** with refresh capability
- **Interactive tabs** for different metrics
- **Visual indicators** for system health
- **Cost projections** and recommendations
- **Responsive design** for all devices

#### Dashboard Sections:
1. **System Health Overview** - Connection status, performance, cache
2. **Usage Statistics** - Storage, operations, costs
3. **Performance Metrics** - Success rates, response times
4. **Access Patterns** - User behavior analysis
5. **Recommendations** - Automated optimization suggestions

## 💰 Cost Optimization

### Cost Calculation:
- **Storage**: $0.015 per GB per month
- **Class A Operations**: $4.50 per million (uploads, deletes)
- **Class B Operations**: $0.36 per million (downloads)

### Cost Estimation Features:
- **Real-time cost tracking**
- **Monthly projections**
- **Storage vs operation cost breakdown**
- **Optimization recommendations**

### Cost Optimization Strategies:
1. **Image Compression** - Reduce storage costs
2. **Cache Optimization** - Reduce API calls
3. **Access Pattern Analysis** - Identify unused content
4. **Batch Operations** - Reduce operation costs

## 🚀 Performance Optimization

### Caching Strategy:
- **Signed URL Caching** - 50-minute cache duration
- **Automatic Cleanup** - Prevents memory leaks
- **Cache Hit Rate** - Monitor cache effectiveness
- **Fallback Mechanism** - Graceful degradation

### Performance Monitoring:
- **Upload Success Rate** - Target >95%
- **Average Upload Time** - Target <2 seconds
- **Cache Hit Rate** - Target >80%
- **Response Time** - Real-time monitoring

### Optimization Recommendations:
- **High Upload Times** - Implement background uploads
- **Low Success Rate** - Review error logs and retry logic
- **High API Calls** - Extend cache duration
- **Large Storage** - Implement compression

## 📊 Access Pattern Analysis

### Tracked Metrics:
- **Total Image Accesses** - Overall usage
- **Unique Images Accessed** - Content diversity
- **Average Accesses per Image** - Popularity patterns
- **Most Accessed Images** - Top content identification
- **Access by Time** - Peak usage identification

### User Behavior Insights:
- **Gallery Views** - Most common access type
- **Modal Views** - Detailed image examination
- **Downloads** - Content sharing patterns
- **Shares** - Social media integration

## 🔍 Monitoring & Alerts

### System Health Indicators:
- **R2 Connection Status** - Real-time connectivity
- **Performance Status** - Success rate monitoring
- **Cache Status** - Memory usage tracking
- **Cost Alerts** - Budget monitoring

### Automated Recommendations:
- **Storage Optimization** - Based on usage patterns
- **Performance Improvements** - Based on metrics
- **Cost Reduction** - Based on current spending
- **Cache Optimization** - Based on hit rates

## 🛠️ Implementation Guide

### 1. Database Migration
```bash
npx prisma migrate dev --name add-r2-analytics-tables
```

### 2. Environment Setup
Ensure all R2 environment variables are configured:
```env
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=your_endpoint_url
```

### 3. Admin Access
The analytics dashboard requires admin privileges:
- User must have `role: 'ADMIN'` in the database
- Access via `/api/analytics/r2-dashboard`

### 4. Component Integration
Add the dashboard to your admin panel:
```tsx
import R2AnalyticsDashboard from '@/components/admin/r2-analytics-dashboard';

// In your admin page
<R2AnalyticsDashboard />
```

## 📈 Usage Examples

### 1. Monitor Daily Usage
```typescript
import { getR2UsageStats } from '@/lib/r2-analytics';

const stats = await getR2UsageStats();
console.log(`R2 Usage: ${stats.r2Percentage}% of images stored in R2`);
console.log(`Storage: ${stats.storageGB} GB used`);
console.log(`Monthly Cost: $${stats.estimatedTotalMonthlyCost}`);
```

### 2. Track Image Access
```typescript
import { trackImageAccess } from '@/lib/r2-analytics';

// Track when user views image in gallery
await trackImageAccess(imageId, 'gallery');

// Track when user opens image modal
await trackImageAccess(imageId, 'modal');

// Track when user downloads image
await trackImageAccess(imageId, 'download');
```

### 3. Monitor Performance
```typescript
import { trackR2Operation } from '@/lib/r2-analytics';

const startTime = Date.now();
try {
  await uploadImageToR2(key, buffer, contentType);
  const duration = Date.now() - startTime;
  await trackR2Operation('upload', true, duration);
} catch (error) {
  const duration = Date.now() - startTime;
  await trackR2Operation('upload', false, duration, error.message);
}
```

## 🔧 Troubleshooting

### Common Issues:

1. **High Upload Failures**
   - Check R2 credentials and permissions
   - Review network connectivity
   - Monitor R2 service status

2. **Low Cache Hit Rate**
   - Increase cache duration
   - Review cache cleanup intervals
   - Monitor memory usage

3. **High Costs**
   - Implement image compression
   - Optimize cache settings
   - Review access patterns

4. **Performance Issues**
   - Monitor upload times
   - Check R2 region settings
   - Review error logs

### Debug Commands:
```bash
# Test R2 connection
curl http://localhost:3000/api/test-r2

# Check analytics data
curl http://localhost:3000/api/analytics/r2-dashboard

# View cache statistics
curl http://localhost:3000/api/test-r2-integration
```

## 🎯 Best Practices

### 1. Regular Monitoring
- Check analytics dashboard daily
- Monitor cost projections weekly
- Review performance metrics monthly

### 2. Optimization
- Implement image compression for large files
- Use appropriate cache durations
- Monitor and adjust based on usage patterns

### 3. Cost Management
- Set up cost alerts
- Regular review of storage usage
- Optimize based on access patterns

### 4. Performance
- Monitor upload success rates
- Track response times
- Optimize cache settings

## 📚 Additional Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS S3 SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

This monitoring and analytics system provides comprehensive insights into your R2 usage, enabling data-driven optimization and cost management decisions. 