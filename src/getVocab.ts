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
    } ${difficulty} level key terms to understand the text that contain: 1) The Vietnamese word, 2) the English translation, 3) root words : ${content}. Please give me the flashcards in an array of objects in valid JSON format: [{"VN": "vietnamese word", "EN": "english translation", "roots": "VN root1(EN translation), VN root2(EN translation)..."},...]. Here is the content: ${content}`;

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
// getVocab(testContent, 20, "A1").then((res) => console.log("A1", res));

// getVocab(testContent, 20, "C2").then((res) => console.log("C2", res));
