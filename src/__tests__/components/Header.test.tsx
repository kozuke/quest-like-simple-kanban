import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../../components/Header';

// Zustandストアをモック
vi.mock('../../store/useAudioStore', () => ({
  useAudioStore: vi.fn(() => ({
    volumeLevel: 'medium',
    cycleVolume: vi.fn(),
    loadFromLocalStorage: vi.fn(),
  })),
}));

describe('Header', () => {
  const mockOpenReportModal = vi.fn();
  const mockOpenTemplateModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display the main title', () => {
    render(<Header openReportModal={mockOpenReportModal} openTemplateModal={mockOpenTemplateModal} />);
    
    expect(screen.getByText('Dragon Task')).toBeInTheDocument();
  });

  it('should display volume button', () => {
    render(<Header openReportModal={mockOpenReportModal} openTemplateModal={mockOpenTemplateModal} />);
    
    expect(screen.getByTitle('音量: 中')).toBeInTheDocument();
  });

  it('should display template button', () => {
    render(<Header openReportModal={mockOpenReportModal} openTemplateModal={mockOpenTemplateModal} />);
    
    expect(screen.getByText('テンプレート')).toBeInTheDocument();
  });

  it('should display report button', () => {
    render(<Header openReportModal={mockOpenReportModal} openTemplateModal={mockOpenTemplateModal} />);
    
    expect(screen.getByText('日報')).toBeInTheDocument();
  });

  it('should call openReportModal when report button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header openReportModal={mockOpenReportModal} openTemplateModal={mockOpenTemplateModal} />);
    
    const reportButton = screen.getByText('日報');
    await user.click(reportButton);
    
    expect(mockOpenReportModal).toHaveBeenCalledTimes(1);
  });

  it('should call openTemplateModal when template button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header openReportModal={mockOpenReportModal} openTemplateModal={mockOpenTemplateModal} />);
    
    const templateButton = screen.getByText('テンプレート');
    await user.click(templateButton);
    
    expect(mockOpenTemplateModal).toHaveBeenCalledTimes(1);
  });

  it('should display logo image', () => {
    render(<Header openReportModal={mockOpenReportModal} openTemplateModal={mockOpenTemplateModal} />);
    
    const logo = screen.getByAltText('Quest Board Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/quest-board-logo.svg');
  });

  it('should have proper header styling', () => {
    render(<Header openReportModal={mockOpenReportModal} openTemplateModal={mockOpenTemplateModal} />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-royal-blue');
  });
}); 