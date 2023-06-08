import getSentences from "../getSentences";

describe("getSentences", () => {
  it("should return an array of objects with the correct properties", async () => {
    const content = `Bloomberg dẫn nguồn tin nội bộ rằng ByteDance, công ty mẹ của TikTok, đang đặt mục tiêu tăng gấp bốn lần quy mô tổng giá trị hàng hóa giao dịch (GMV) trên toàn cầu của TikTok Shop, lên mức 20 tỷ USD riêng trong năm nay. Năm ngoái, chỉ số GMV của nền tảng đạt 4,4 tỷ USD chỉ sau một năm ra mắt.

    Theo nguồn tin, TikTok đang đặt cược nhiều nhất vào thị trường Đông Nam Á, trong đó có Việt Nam và Indonesia - nơi những người có ảnh hưởng (idol) trên nền tảng bán mọi thứ từ quần áo đến son môi trong các buổi livestream. Mỹ và châu Âu cũng đang là những nơi TikTok nhắm tới, dù thị phần dự kiến chiếm phần rất nhỏ trong mục tiêu 20 tỷ USD.

    Minh họa tính năng TikTok Shop trên TikTok. Ảnh: TikTok
    Minh họa tính năng TikTok Shop. Ảnh: TikTok

    Nếu triển khai TikTok Shop ở Mỹ, đây có thể là nơi nền tảng này gặp khó khăn nhất dù đang có 150 triệu người dùng hàng tháng. Nền tảng đứng trước nguy cơ bị cấm hoặc bị giới hạn ở một số bang. Chính quyền Mỹ cũng cân nhắc loại bỏ mạng video ngắn này do lo ngại "đe dọa an ninh quốc gia" - điều mà công ty Trung Quốc nhiều lần phản đối.

    ByteDance thành lập cách đây hơn một thập kỷ và nhanh chóng phát triển thành đế chế Internet trị giá 200 tỷ USD nhờ mạng xã hội TikTok và Douyin, trong đó TikTok dành cho thị trường quốc tế và Douyin cho riêng Trung Quốc. Mô hình bán hàng trên nền tảng cũng đã được triển khai trên Douyin trước đó và thu về nhiều thành công tại quê nhà.`;

    const sentences = await getSentences(content);

    expect(Array.isArray(sentences)).toBe(true);

    sentences.forEach((sentence) => {
      expect(typeof sentence.VN).toBe("string");
      expect(typeof sentence.EN).toBe("string");
    });

    console.log(sentences);
  });
});
