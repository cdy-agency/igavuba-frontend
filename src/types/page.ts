export interface Page {
  id: string;
  title: string;
  content?: string;
  resources?: Array<{
    name: string;
    url: string;
  }>;
}

export interface Chapter {
  id: string;
  title: string;
  pages: Page[];
}
