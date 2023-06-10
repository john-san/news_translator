import { ChatGPTAPI } from "chatgpt";
import dotenv from "dotenv";
dotenv.config();
import { sleep, parseJson } from "./utils";

type Vocab = {
  VN: string;
  EN: string;
  roots: string;
};

export default async function getVocab(
  content: string,
  num: number = 20,
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" = "C1"
): Promise<Vocab[]> {
  const api = new ChatGPTAPI({
    apiKey: process.env.CHATGPT_API_KEY ?? "",
    completionParams: {
      model: "gpt-3.5-turbo",
      temperature: 0.5, // lower = more conservative, deterministic text
    },
  });
  // if num is greater than 20, ask for 20 at a time until num is less than 20
  let result: Vocab[] = [];
  let tempArray: Vocab[] = [];

  let CHUNK_SIZE = 20;
  let remaining = num;
  let parentMessageId: string | undefined = "";

  while (remaining > 0) {
    let numToAskFor = remaining >= CHUNK_SIZE ? CHUNK_SIZE : remaining;
    let firstTimeAsking = remaining == num;
    console.log(`Asking ChatGPT for ${firstTimeAsking ? "" : "more "}vocab.`);
    let question = `From the following text, can you provide me with ${numToAskFor} ${
      firstTimeAsking ? "" : "NEW(not given previously)"
    } ${difficulty} level key terms to understand the text that contain: 1) The Vietnamese word, 2) the English translation, 3) root words. Please give me the flashcards in an array of objects in valid JSON format: [{"VN": "vietnamese word", "EN": "english translation", "roots": "VN root1(EN translation), VN root2(EN translation)..."},...]. Here is the content: ${content}`;

    // Todo: fix any type
    let res: any = await api.sendMessage(question, { parentMessageId });
    tempArray = parseJson(res.text);

    // if tempArray is empty, ask again
    let counter = 1;
    while (tempArray.length == 0 && counter < 6) {
      console.log(
        `Didn't get an array of vocab. Will ask again after 10 second cooldown. Retries left: ${
          6 - counter
        }`
      );
      await sleep(10);
      // follow up question
      question = `I didn't get an array of objects in valid JSON format. Please try again. Please give me ${numToAskFor} ${
        remaining == num ? "" : "NEW(not given previously)"
      } ${difficulty} level key terms from the previous Vietnamese text in an array of objects in valid JSON format: [{"VN": "vietnamese word", "EN": "english translation", "roots": "VN root1(EN translation), VN root2(EN translation),..."},...]`;

      res = await api.sendMessage(question, {
        parentMessageId: res.id,
      });

      // set parentMessageId to the id of the last message for next iteration
      parentMessageId = res.parentMessageId;

      tempArray = parseJson(res.text);
      counter++;
    }

    console.log("Successfully retrieved vocab for this iteration.");

    // merge tempArray with result
    result = result.concat(tempArray);
    // decrement remaining by CHUNK_SIZE. If remaining is less than CHUNK_SIZE, it is on the last iteration, so set remaining to 0
    remaining = remaining >= CHUNK_SIZE ? remaining - CHUNK_SIZE : 0;
  }
  // truncate result to num just in case result is greater than num. ChatGPT sometimes provides +1 additional result
  result = result.slice(0, num);

  console.log("result.length:", result.length);

  return result;
}

// test
// Todo: create unit tests
/*
const testContent = `4
Số hóaCông nghệĐời sống sốThứ năm, 8/6/2023, 14:39 (GMT+7)
Tham vọng 20 tỷ USD của TikTok Shop
Với thuật toán cuốn người xem vào những video như vô tận, TikTok Shop đang cho thấy mình có khả năng vượt đối thủ ở mảng thương mại điện tử.

Mới ra mắt năm 2021 nhưng TikTok Shop nhanh chóng nhận được sự chú ý lớn. Với thuật toán lan truyền và giữ chân người dùng của TikTok, ngày càng nhiều người bị cuốn vào các video và những buổi livestream (phát trực tiếp) mà họ không thể rời mắt.

Bloomberg dẫn nguồn tin nội bộ rằng ByteDance, công ty mẹ của TikTok, đang đặt mục tiêu tăng gấp bốn lần quy mô tổng giá trị hàng hóa giao dịch (GMV) trên toàn cầu của TikTok Shop, lên mức 20 tỷ USD riêng trong năm nay. Năm ngoái, chỉ số GMV của nền tảng đạt 4,4 tỷ USD chỉ sau một năm ra mắt.

Theo nguồn tin, TikTok đang đặt cược nhiều nhất vào thị trường Đông Nam Á, trong đó có Việt Nam và Indonesia - nơi những người có ảnh hưởng (idol) trên nền tảng bán mọi thứ từ quần áo đến son môi trong các buổi livestream. Mỹ và châu Âu cũng đang là những nơi TikTok nhắm tới, dù thị phần dự kiến chiếm phần rất nhỏ trong mục tiêu 20 tỷ USD.

Minh họa tính năng TikTok Shop trên TikTok. Ảnh: TikTok
Minh họa tính năng TikTok Shop. Ảnh: TikTok

Nếu triển khai TikTok Shop ở Mỹ, đây có thể là nơi nền tảng này gặp khó khăn nhất dù đang có 150 triệu người dùng hàng tháng. Nền tảng đứng trước nguy cơ bị cấm hoặc bị giới hạn ở một số bang. Chính quyền Mỹ cũng cân nhắc loại bỏ mạng video ngắn này do lo ngại "đe dọa an ninh quốc gia" - điều mà công ty Trung Quốc nhiều lần phản đối.

ByteDance thành lập cách đây hơn một thập kỷ và nhanh chóng phát triển thành đế chế Internet trị giá 200 tỷ USD nhờ mạng xã hội TikTok và Douyin, trong đó TikTok dành cho thị trường quốc tế và Douyin cho riêng Trung Quốc. Mô hình bán hàng trên nền tảng cũng đã được triển khai trên Douyin trước đó và thu về nhiều thành công tại quê nhà.

Với khả năng "kết hợp giải trí với mua hàng chớp nhoáng", TikTok Shop cho phép người dùng chọn mua nhanh chóng món hàng mình thích qua việc cuộn vô số video ngắn và phát trực tiếp trên ứng dụng. Tính năng này được đánh giá là thuận tiện hơn nhiều so với Shopee của Sea Limited hay Amazon nhờ vào cơ sở dữ liệu rộng lớn và thuật toán đề xuất tối ưu, dù các nền tảng kể trên cũng có tính năng phát trực tiếp.

Hiện TikTok vẫn là mạng xã hội gây nghiện nhiều nhất. Theo Data.ai, trung bình mỗi tháng tại Mỹ năm ngoái, người dùng bỏ ra 28,7 tiếng để lướt TikTok, cao hơn mức 22,8 tiếng năm 2021. Trong khi đó, chỉ số của Facebook là 15,5 tiếng (2022) và 16,8 tiếng (2021).

Do mới ra đời hai năm, TikTok Shop chỉ chiếm một phần nhỏ trong doanh thu 80 tỷ USD của ByteDance năm ngoái. Chỉ số GMV của nền tảng cũng thấp hơn nhiều so với mức 73,5 tỷ USD của Sea Limited. Tuy nhiên, theo giới chuyên gia, TikTok Shop nếu thành công có thể giúp ByteDance chứng minh mô hình bán hàng qua video ngắn đang trở nên phù hợp hơn với người dùng. Thậm chí, hình thức này có thể sớm đuổi kịp và vượt qua thói quen mua sắm trực tuyến truyền thống.`;
*/
/*
const testContent2 = `Đây là vấn đề mà Clay Cockrell, nhà trị liệu tâm lý chuyên làm việc với người giàu có ở Mỹ, nhận ra sau nhiều năm làm việc với khách hàng. Khi tất cả nhu cầu tài chính 
đều đã được đáp ứng, con cái trong các gia đình siêu giàu gặp hiện tượng lòng tự trọng thấp, sự thiếu tự tin và sống lệ thuộc vào cha mẹ ngay cả khi trưởng thành.Trong quá trình trị liệu tâm lý, các chuyên gia cũng nhận thấy người sinh ra trong gia cảnh bình thường luôn có nghị lực sống, khao khát thành công. Trong khi nhóm "sinh ra ở vạch đích" chỉ lo lắng 
bị mất quyền thừa kế. Trong những gia đình này, tiền bạc, địa vị và quyền lực vốn có thể trở thành thước đo để đánh giá mức độ xứng đáng của bản thân với tư cách là một con người.Như trong bộ phim "Succession" được chiếu trên kênh truyền hình HBO mô tả cuộc đấu đá, tranh giành thừa kế giữa các thế hệ của gia đình Roy giàu có. Dù có những tình tiết hư cấu nhưng nội dung chính của bộ phim vẫn bám sát thực tế khi so sánh cuộc sống của giới siêu giàu và những người thừa kế.Ông Cockrell nhận thấy điểm tương đồng giữa người thừa kế ngoài đời và những đứa con của Logan Roy, người đứng đầu gia đình trong bộ phim. Theo đó, họ luôn thể hiện bản thân dũng cảm, hoàn hảo nhưng ẩn bên trong là sự nông cạn và sợ hãi. Người thừa kế luôn phô trương cuộc sống xa hoa, giàu có nhưng luôn tìm đến bác sĩ tâm lý để chữa trị nỗi lo lắng, bất an nội tâm. Ảnh minh họa: Extreme-Photographer/Getty ImagesPaul Hokemeyer, chuyên gia tâm lý, người từng tham vấn cho nhiều người siêu giàu, nhận ra thế hệ thứ hai của các gia đình siêu giàu có thể bị ám ảnh bởi khối lượng tài sản thừa kế. Không ít người luôn tự vấn bản thân rằng những người xung quanh kết bạn với mình vì con người thật hay chỉ bởi tài sản sẽ được sở hữu.Chuyên gia cũng cho rằng sự giàu có thể cô lập một cá nhân với những người xung quanh. "Họ cảm thấy tội lỗi vì sở hữu nhiều tài sản mà thế giới tôn sùng, nhưng đồng thời thấy bản thân thiếu sót, không thỏa mãn hay hạnh phúc", Hokemeyer 
nói.Nghiên cứu của Daniel Kahneman và Matthew Killingsworth công bố trong Kỷ yếu của Viện Hàn lâm Khoa học Quốc gia Mỹ tháng 3/2023, chỉ ra "cảm giác hạnh phúc có xu hướng tăng lên cùng sự giàu có". Nhưng đối với con cái của giới siêu giàu, sự bất hạnh và lòng tự trọng thấp dường như đi kèm với khối tài sản.Hokemeyer cũng nhận thấy sự khác biệt về tâm lý giữa người tạo ra của cải và người thừa kế, bắt nguồn từ ý thức về quyền tự quyết của một người nằm ở bên trong hay ngoài. Một khái niệm được gọi là "vị trí kiểm soát" (locus of control).Theo đó, những người thừa kế hoặc kết hôn với người giàu phải chịu sự kiểm soát từ bên ngoài. Nghĩa là họ phải chấp nhận cuộc sống chịu ảnh hưởng nặng nề bởi những thứ nằm ngoài quyền tự quyết của bản thân. Điều này có thể làm xói mòn ý thức cá nhân của họ.Khi bị lu mờ bởi hào quang của sự giàu có, con người không thể phát triển được sự tự tin lành mạnh 
và kiên định. Họ sẽ luôn nghi ngờ về khả năng đóng góp của mình với thế giới và hoài nghi về việc những lời khen ngợi được nhận. Được nhận khối tài sản khổng lồ khiến nhiều người thừa kế sống trong sự nghi ngờ của bản thân và cô lập từ xã hội. Ảnh minh họa: iStockNigel Nicholson, giáo sư về hành vi tổ chức tại Trường Kinh doanh London (Anh), nói rằng trong cuộc chiến thừa kế có hai xung đột chính cần được giải quyết. Một là xung đột giữa cha mẹ - con cái, và hai là sự ganh đua giữa anh chị em ruột.Sự ganh đua của anh chị em bắt đầu từ tâm lý tranh giành sự chú ý của cha mẹ. Trong khi xung đột giữa các thế hệ là do phụ huynh nghi ngờ năng lực của con và không dám trao quyền tự quyết cho chúng."Thế hệ đi trước tin rằng bản thân biết điều gì là tốt nhất cho con cháu. Nhưng thế hệ sau lại tin vào quyết định của chính mình. Trong trường hợp này người đi trước nên nhường bước. Các bậc phụ huynh cần tạo điều kiện để trẻ phát triển bản thân thay vì sống thụ động vào tài sản không phải do mình làm ra", ông Nicholson đưa lời khuyên.Bên cạnh đó, cố vấn gia đình Diana Chambers cũng cho rằng cha mẹ nên dạy con trẻ cách quản lý tài chính và cảnh báo những gánh nặng đi kèm khi trở thành người thừa kế, từ sớm. Còn riêng bản thân người thừa kế cũng nên xây 
dựng ý thức độc lập, biết phát triển sự nghiệp riêng trước khi tiếp quản khối tài sản khổng lồ.Minh Phương (Theo Washington Post) Số người siêu giàu ở Việt Nam tăng gấp đôi sau 5 năm Việt Nam năm ngoái có hơn 1.000 người siêu giàu, tăng gần gấp đôi so với năm 2017, theo báo cáo mới nhất của Knight Frank. 194 Vì sao nhiều người giàu ngại khoe của? Nhiều người trong giới siêu giàu không bao giờ phô trương tài sản qua siêu xe, đồ hiệu đắt tiền để tránh sự soi mói. 57 8 tư duy khác biệt của người siêu giàu Không lãng phí thời gian, tự làm mọi thứ, biết kiểm soát nợ và đầu tư khôn ngoan là cách biến người giàu thành siêu giàu. 12 Cách tiêu tiền của giới siêu giàu Nhiều tỷ phú trên thế giới không ngần ngại chi 292.000 USD cho một đêm thuê phòng khách sạn hoặc hàng nghìn USD để ăn tối. 7 Con nhà siêu giàu học cách giữ tiền Những khóa học ngắn hạn và dài hạn giúp con cái của những gia đình đại gia châu Á duy trì sự giàu có. 2`; */
// getVocab(testContent, 20, "A1").then((res) => console.log("A1", res));

// getVocab(testContent, 20, "C2").then((res) => console.log("C2", res));

// getVocab(testContent2, 20, "C2").then((res) => console.log("C2", res));
