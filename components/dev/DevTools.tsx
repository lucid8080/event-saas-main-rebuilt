'use client';

import { useState, useEffect } from 'react';
import { devUtils, devFeatures, devPerformance } from '../../lib/dev-config';
import { memoryUtils } from '../../lib/memory-leak-detection';
import { dbUtils } from '../../lib/database-optimization';
import { apiUtils } from '../../lib/api-cleanup';
import { imageUtils } from '../../lib/image-optimization';
import { cleanupUtils } from '../../lib/cleanup-manager';

interface DevToolsProps {
  isVisible?: boolean;
}

export function DevTools({ isVisible = false }: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(isVisible);
  const [memoryUsage, setMemoryUsage] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'performance' | 'memory' | 'bundles' | 'errors' | 'cleanup'>('performance');
  const [cleanupStats, setCleanupStats] = useState<any>(null);

  useEffect(() => {
    if (!devFeatures.enableDevTools) return;

               // Monitor memory usage
           const memoryInterval = setInterval(() => {
             if (typeof process !== 'undefined') {
               const usage = process.memoryUsage();
               setMemoryUsage({
                 rss: Math.round(usage.rss / 1024 / 1024),
                 heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
                 heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
                 external: Math.round(usage.external / 1024 / 1024),
               });
             }
           }, 2000);

           // Monitor cleanup stats
           const cleanupInterval = setInterval(() => {
             try {
               const stats = cleanupUtils.getCleanupStats();
               setCleanupStats(stats);
             } catch (error) {
               console.error('Failed to get cleanup stats:', error);
             }
           }, 5000);

    // Monitor performance
    if (typeof window !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        setPerformanceMetrics(prev => [
          ...entries.map(entry => ({
            name: entry.name,
            duration: entry.duration,
            timestamp: Date.now(),
          })),
          ...prev.slice(0, 9), // Keep last 10 entries
        ]);
      });

      observer.observe({ entryTypes: ['resource', 'navigation'] });

                   return () => {
               clearInterval(memoryInterval);
               clearInterval(cleanupInterval);
               observer.disconnect();
             };
           }

           return () => {
             clearInterval(memoryInterval);
             clearInterval(cleanupInterval);
           };
  }, []);

  if (!devFeatures.enableDevTools) return null;

  return (
    <>
      {/* Dev Tools Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Development Tools"
      >
        🛠️
      </button>

      {/* Dev Tools Panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-96 h-96 bg-white border border-gray-300 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Development Tools</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
                           <div className="flex border-b border-gray-200">
                   {[
                     { id: 'performance', label: 'Performance' },
                     { id: 'memory', label: 'Memory' },
                     { id: 'bundles', label: 'Bundles' },
                     { id: 'errors', label: 'Errors' },
                     { id: 'cleanup', label: 'Cleanup' },
                   ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-3 py-2 text-sm ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-3 h-64 overflow-y-auto">
            {activeTab === 'performance' && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Performance Metrics</h4>
                {performanceMetrics.length === 0 ? (
                  <p className="text-gray-500 text-sm">No performance data yet...</p>
                ) : (
                  <div className="space-y-1">
                    {performanceMetrics.slice(0, 5).map((metric, index) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-gray-600">{metric.duration.toFixed(2)}ms</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'memory' && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Memory Usage</h4>
                {memoryUsage ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>RSS:</span>
                      <span className={`font-medium ${
                        memoryUsage.rss > devPerformance.maxMemoryUsage ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {memoryUsage.rss}MB
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Heap Total:</span>
                      <span>{memoryUsage.heapTotal}MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Heap Used:</span>
                      <span>{memoryUsage.heapUsed}MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>External:</span>
                      <span>{memoryUsage.external}MB</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Loading memory data...</p>
                )}
              </div>
            )}

            {activeTab === 'bundles' && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Bundle Analysis</h4>
                <p className="text-gray-500 text-sm">
                  Run <code className="bg-gray-100 px-1 rounded">npm run analyze</code> to see bundle analysis.
                </p>
                <button
                  onClick={() => {
                    devUtils.logBundleSize('main', 1024 * 1024); // Example
                  }}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Test Bundle Logging
                </button>
              </div>
            )}

                               {activeTab === 'errors' && (
                     <div className="space-y-2">
                       <h4 className="font-medium text-gray-800">Error Log</h4>
                       <p className="text-gray-500 text-sm">No errors logged yet...</p>
                       <button
                         onClick={() => {
                           console.error('Test error from DevTools');
                         }}
                         className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                       >
                         Test Error Logging
                       </button>
                     </div>
                   )}

                   {activeTab === 'cleanup' && (
                     <div className="space-y-2">
                       <h4 className="font-medium text-gray-800">Cleanup Management</h4>
                       {cleanupStats ? (
                         <div className="space-y-2">
                           <div className="text-xs">
                             <div className="flex justify-between">
                               <span>Auto Cleanup:</span>
                               <span className={cleanupStats.isRunning ? 'text-green-600' : 'text-red-600'}>
                                 {cleanupStats.isRunning ? 'Running' : 'Stopped'}
                               </span>
                             </div>
                             <div className="flex justify-between">
                               <span>Memory:</span>
                               <span>{cleanupStats.resourceMetrics.memory.heapUsed}MB</span>
                             </div>
                             <div className="flex justify-between">
                               <span>Cache Size:</span>
                               <span>{cleanupStats.resourceMetrics.cache.size}</span>
                             </div>
                             <div className="flex justify-between">
                               <span>Connections:</span>
                               <span>{cleanupStats.resourceMetrics.connections.total}</span>
                             </div>
                           </div>
                           
                           <div className="space-y-1">
                             <button
                               onClick={() => cleanupUtils.performManualCleanup()}
                               className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 w-full"
                             >
                               Manual Cleanup
                             </button>
                             <button
                               onClick={() => memoryUtils.forceGC()}
                               className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 w-full"
                             >
                               Force GC
                             </button>
                           </div>

                           {cleanupStats.recommendations.length > 0 && (
                             <div className="text-xs">
                               <div className="font-medium text-orange-600">Recommendations:</div>
                               {cleanupStats.recommendations.slice(0, 2).map((rec: string, index: number) => (
                                 <div key={index} className="text-gray-600">• {rec}</div>
                               ))}
                             </div>
                           )}
                         </div>
                       ) : (
                         <p className="text-gray-500 text-sm">Loading cleanup data...</p>
                       )}
                     </div>
                   )}
                 </div>
               </div>
             )}
           </>
         );
       } 