type ReferenceSource = 'dribbble' | 'pinterest' | 'behance';

type Reference = {
  title: string;
  source: ReferenceSource;
  url: string;
  note: string;
};

interface ReferenceProvider {
  search(query: string, source: ReferenceSource | string): Promise<Reference[]>;
}

// Safe baseline provider: creates source search links without scraping or copying artwork.
class SearchLinkProvider implements ReferenceProvider {
  async search(query: string, source: ReferenceSource | string): Promise<Reference[]> {
    const safeSource: ReferenceSource = source === 'pinterest' || source === 'behance' ? source : 'dribbble';
    const encoded = encodeURIComponent(query.trim());
    const base = {
      dribbble: 'https://dribbble.com/search/',
      pinterest: 'https://www.pinterest.com/search/pins/?q=',
      behance: 'https://www.behance.net/search/projects?search='
    }[safeSource];
    return [{
      title: `${query} inspiration on ${source}`,
      source: safeSource,
      url: `${base}${encoded}`,
      note: 'Open and review manually. Use this reference for patterns, not copied artwork.'
    }];
  }
}

