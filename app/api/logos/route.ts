import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('search');
  const limit = searchParams.get('limit') || '10';

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    // Fetch logos from SVGL API with better search
    const apiUrl = `https://api.svgl.app?search=${encodeURIComponent(query)}&limit=${limit}`;
    console.log('Fetching from SVGL API:', apiUrl);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`SVGL API responded with status: ${response.status}`);
    }

    const logos = await response.json();
    console.log('Raw SVGL response:', logos.length, 'logos found');

    // Filter for better matches - prioritize exact matches and popular brands
    const filteredLogos = logos.filter((logo: any) => {
      const title = logo.title?.toLowerCase() || '';
      const category = logo.category?.toLowerCase() || '';
      const queryLower = query.toLowerCase();
      
      // Exact match gets highest priority
      if (title === queryLower) return true;
      
      // Starts with query
      if (title.startsWith(queryLower)) return true;
      
      // Contains query
      if (title.includes(queryLower)) return true;
      
      // Popular brands that might be abbreviated
      const popularBrands = ['google', 'apple', 'microsoft', 'facebook', 'twitter', 'instagram', 'nike', 'adidas', 'starbucks', 'coca-cola'];
      if (popularBrands.some(brand => title.includes(brand) || brand.includes(queryLower))) return true;
      
      return false;
    });

    console.log('Filtered logos:', filteredLogos.length, 'logos after filtering');

    // Fetch SVG content for each logo (limit to first 5 for performance)
    const logosToProcess = filteredLogos.slice(0, 5);
    const logosWithSvg = await Promise.all(
      logosToProcess.map(async (logo: any) => {
        let svgContent = '';
        
        try {
          if (typeof logo.route === 'string') {
            const svgResponse = await fetch(logo.route);
            if (svgResponse.ok) {
              svgContent = await svgResponse.text();
            }
          } else if (logo.route && typeof logo.route === 'object') {
            // Handle light/dark theme variants - prefer light theme
            const svgUrl = logo.route.light || logo.route.dark;
            const svgResponse = await fetch(svgUrl);
            if (svgResponse.ok) {
              svgContent = await svgResponse.text();
            }
          }
        } catch (error) {
          console.error(`Failed to fetch SVG for ${logo.title}:`, error);
        }

        return {
          id: logo.id?.toString() || logo.title?.toLowerCase(),
          name: logo.title,
          svg: svgContent,
          url: logo.url,
          category: logo.category
        };
      })
    );

    // Filter out logos without SVG content
    let validLogos = logosWithSvg.filter((logo: any) => logo.svg);

    // If we don't have good results, try category-based search
    if (validLogos.length === 0) {
      console.log('No good results, trying category search...');
      
      // Try searching by category for common brand categories
      const categoryMap: { [key: string]: string[] } = {
        'google': ['software', 'technology'],
        'apple': ['software', 'technology'],
        'microsoft': ['software', 'technology'],
        'facebook': ['social', 'software'],
        'twitter': ['social', 'software'],
        'instagram': ['social', 'software'],
        'nike': ['sports', 'fashion'],
        'adidas': ['sports', 'fashion'],
        'starbucks': ['food', 'entertainment'],
        'coca-cola': ['food', 'entertainment']
      };

      const categories = categoryMap[query.toLowerCase()] || ['software', 'social', 'food', 'sports'];
      
      for (const category of categories) {
        try {
          const categoryResponse = await fetch(`https://api.svgl.app/category/${category}`);
          if (categoryResponse.ok) {
            const categoryLogos = await categoryResponse.json();
            const categoryLogosWithSvg = await Promise.all(
              categoryLogos.slice(0, 3).map(async (logo: any) => {
                let svgContent = '';
                try {
                  if (typeof logo.route === 'string') {
                    const svgResponse = await fetch(logo.route);
                    if (svgResponse.ok) {
                      svgContent = await svgResponse.text();
                    }
                  } else if (logo.route && typeof logo.route === 'object') {
                    const svgUrl = logo.route.light || logo.route.dark;
                    const svgResponse = await fetch(svgUrl);
                    if (svgResponse.ok) {
                      svgContent = await svgResponse.text();
                    }
                  }
                } catch (error) {
                  console.error(`Failed to fetch SVG for ${logo.title}:`, error);
                }

                return {
                  id: logo.id?.toString() || logo.title?.toLowerCase(),
                  name: logo.title,
                  svg: svgContent,
                  url: logo.url,
                  category: logo.category
                };
              })
            );
            
            validLogos = categoryLogosWithSvg.filter((logo: any) => logo.svg);
            if (validLogos.length > 0) break;
          }
        } catch (error) {
          console.error(`Category search failed for ${category}:`, error);
        }
      }
    }

    console.log('Final results:', validLogos.length, 'logos');
    return NextResponse.json(validLogos);
  } catch (error) {
    console.error('Error fetching logos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logos from SVGL API' },
      { status: 500 }
    );
  }
} 