import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import I18nConfig from "./I18nConfig";
import * as i18nService from "@/services/i18nService";
import { useToast } from "@/hooks/use-toast";

// Mock the i18n service
jest.mock("@/services/i18nService", () => ({
  getI18nCategories: jest.fn(),
  getI18nTranslations: jest.fn(),
  updateI18nTranslation: jest.fn(),
  deleteI18nTranslation: jest.fn(),
  createI18nTranslation: jest.fn(),
  exportI18nTranslations: jest.fn(),
  importI18nTranslations: jest.fn(),
}));

// Mock the useToast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}));

// Mock window.URL.createObjectURL
Object.defineProperty(window.URL, "createObjectURL", {
  writable: true,
  value: jest.fn(),
});

describe("I18nConfig", () => {
  const mockToast = jest.fn();
  const mockCategories = [
    { id: "nav", name: "导航菜单", count: 15 },
    { id: "hero", name: "首页横幅", count: 20 },
  ];
  const mockTranslations = [
    { id: "1", key: "nav.platformName", zh: "AI营销平台", en: "AI Marketing Platform" },
    { id: "2", key: "nav.productFeatures", zh: "产品特色", en: "Product Features" },
  ];

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    (i18nService.getI18nCategories as jest.Mock).mockResolvedValue({
      data: mockCategories,
    });
    (i18nService.getI18nTranslations as jest.Mock).mockResolvedValue({
      data: mockTranslations,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    render(<I18nConfig />);
    expect(screen.getByText("加载中...")).toBeInTheDocument();
  });

  it("loads and displays categories and translations", async () => {
    render(<I18nConfig />);
    
    await waitFor(() => {
      expect(screen.getByText("导航菜单")).toBeInTheDocument();
      expect(screen.getByText("首页横幅")).toBeInTheDocument();
      expect(screen.getByText("AI营销平台")).toBeInTheDocument();
      expect(screen.getByText("产品特色")).toBeInTheDocument();
    });
  });

  it("filters translations by category", async () => {
    render(<I18nConfig />);
    
    await waitFor(() => {
      expect(screen.getByText("导航菜单")).toBeInTheDocument();
    });
    
    // Click on the first category
    const navCategory = screen.getByText("导航菜单");
    await userEvent.click(navCategory);
    
    // Check that translations are filtered
    expect(screen.getByText("AI营销平台")).toBeInTheDocument();
    expect(screen.getByText("产品特色")).toBeInTheDocument();
  });

  it("filters translations by search term", async () => {
    render(<I18nConfig />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText("搜索文案...")).toBeInTheDocument();
    });
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText("搜索文案...");
    await userEvent.type(searchInput, "平台");
    
    // Check that translations are filtered
    expect(screen.getByText("AI营销平台")).toBeInTheDocument();
    // This one should not be visible anymore
    expect(screen.queryByText("产品特色")).not.toBeInTheDocument();
  });

  it("opens add dialog when add button is clicked", async () => {
    render(<I18nConfig />);
    
    await waitFor(() => {
      expect(screen.getByText("新增文案")).toBeInTheDocument();
    });
    
    const addButton = screen.getByText("新增文案");
    await userEvent.click(addButton);
    
    expect(screen.getByText("新增翻译文案")).toBeInTheDocument();
  });

  it("opens edit dialog when edit button is clicked", async () => {
    render(<I18nConfig />);
    
    await waitFor(() => {
      expect(screen.getByText("AI营销平台")).toBeInTheDocument();
    });
    
    const editButton = screen.getAllByRole("button", { name: "" })[0]; // First edit button
    await userEvent.click(editButton);
    
    expect(screen.getByText("编辑翻译文案")).toBeInTheDocument();
  });
});