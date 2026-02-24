import { Rule } from "@/pages/SegmentBuilder";
import { request } from "@/lib/request";

export interface Segment {
  id: string;
  segmentName: string;
  description: string;
  rules: Rule[];
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = "saved_segments";

export const segmentService = {
  getSegments(): Segment[] {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load segments", e);
      return [];
    }
  },

  getSegmentById(id: string): Segment | undefined {
    return this.getSegments().find((s) => s.id === id);
  },

  saveSegment(segment: Segment): void {
    const segments = this.getSegments();
    const existingIndex = segments.findIndex((s) => s.id === segment.id);

    if (existingIndex >= 0) {
      segments[existingIndex] = segment;
    } else {
      segments.push(segment);
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
  },

  async deleteSegment(id: string): Promise<void> {
    try {
      await request.delete("/quote/api/v1/segment", {
        data: { id },
      });
    } catch (error) {
      console.error("Failed to delete segment", error);
      throw error;
    }
  },

  async createOrUpdateSegment(segment: Partial<Segment>): Promise<void> {
    try {
      await request.post("/quote/api/v1/segment", {
        segmentName: segment.segmentName,
        description: segment.description,
        ruleContent: JSON.stringify(segment.rules),
        id: segment.id ?? undefined,
      });
    } catch (error) {
      console.error("Failed to save segment to API", error);
      throw error;
    }
  },

  async getSegmentsPage(currentPage: number, pageSize: number): Promise<{ records: Segment[]; total: number }> {
    try {
      const response = await request.post<{
        data: {
          records: any[];
          total: number;
        };
      }>("/quote/api/v1/segment/page", {
        data: {
          currentPage,
          pageSize,
        },
      });

      const list = response.data.data.records.map((item) => ({
        id: item.id,
        segmentName: item.segmentName,
        description: item.description,
        rules: item.ruleContent ? JSON.parse(item.ruleContent) : [],
        createdAt: item.gmtCreate,
        updatedAt: item.gmtModified,
      }));

      return {
        records: list,
        total: response.data.data.total,
      };
    } catch (error) {
      console.error("Failed to fetch segments page", error);
      return { records: [], total: 0 };
    }
  },

  async getPreviewUsers(rules: Rule[]): Promise<any[]> {
    try {
      const response = await request.post<{ data: any }>("/quote/api/v1/segment/list", {
        ruleContent: JSON.stringify(rules),
      });
      return response.data.data.records || [];
    } catch (error) {
      console.error("Failed to fetch preview users", error);
      return [];
    }
  },
};
