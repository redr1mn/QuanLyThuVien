namespace QuanLyThuVien.Models
{
    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        public int PublishYear { get; set; }
        public decimal Price { get; set; }
        public string Location { get; set; } = string.Empty;
        public int AvailableQuantity { get; set; }
        public int TotalQuantity { get; set; }
        public string CoverImage { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
