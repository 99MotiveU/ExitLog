package com.exitlog;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.exitlog.calendar.model.entity.JobPost;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

class JobPostMappingTest {


    ObjectMapper objectMapper = new ObjectMapper();

    @Test
    public void testJobPostListMapping() throws Exception {
        String jsonArray = "[\n" +
                "{\"url\":\"http://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=50691271&utm_source=job-search-api&utm_medium=api&utm_campaign=saramin-job-search-api\",\"active\":1,\"company\":{\"detail\":{\"href\":\"http://www.saramin.co.kr/zf_user/company-info/view?csn=3108703114&utm_source=job-search-api&utm_medium=api&utm_campaign=saramin-job-search-api\",\"name\":\"샤오미테크놀로지코리아유한책임회사\"}},\"position\":{\"title\":\"[Xiaomi Korea] 2025 공개채용\",\"industry\":{\"code\":\"802\",\"name\":\"판매(상품품목별)\"},\"location\":{\"code\":\"101110,101120,101130,101140,101160,101200,101210,101240\",\"name\":\"서울 &gt; 동대문구,서울 &gt; 동작구,서울 &gt; 마포구,서울 &gt; 서대문구,서울 &gt; 성동구,서울 &gt; 영등포구,서울 &gt; 용산구,서울 &gt; 중구\"},\"job-type\":{\"code\":\"1\",\"name\":\"정규직\"},\"job-mid-code\":{\"code\":\"11,12,2,14,4,15,5,16,18,8,10\",\"name\":\"IT개발·데이터,총무·법무·사무,인사·노무·HRD,영업·판매·무역,서비스,생산,상품기획·MD,마케팅·홍보·조사,디자인,기획·전략,구매·자재·물류\"},\"job-code\":{\"code\":\"100,153,167,388,397,423,426,429,431,440,445,449,692,706,709,714,715,725,726,739,741,747,751,755,761,767,793,871,888,908,919,930,931,933,968,972,1149,1153,1213,1215,1258,1259,1260,1264,1265,1279,1412,1413,1419,1421,1423,1424,1425,1426,1428,1429,1432,1435,1437,1439,1443,1459,1468,1469,1504,1507,1524,1600,1614,1625,1629,1633,1648,1649,1661,1664,1676,1685,1751,1754,1755,1759,1761,1763,1764,1795,2198,2201,2202,2203,2225\",\"name\":\"가전·오디오판매,SE(시스템엔지니어),H/W,S/W,사무직,컴플라이언스,Excel,PhotoShop,경영지원,채용담당자,면접/인터뷰,온보딩,인사행정,기술영업,판매직,가전판매,기계판매,네트워크영업,영업판촉,온라인판매,컴퓨터판매,통신기기판매,핸드폰판매,IT영업,B2C,고객관리,매장관리,핸드폰영업,매장매니저,안내데스크,캐셔,홀매니저,고객안내,고객응대,기계수리,대형마트,백화점,리테일MD,브랜드MD,이커머스,자사몰관리,전자제품,채널관리,트렌드분석,SNS,마케팅기획,마케팅전략,SNS마케팅,광고마케팅,글로벌마케팅,기업홍보,디지털마케팅,모바일마케팅,바이럴마케팅,브랜드마케팅,온라인마케팅,콘텐츠마케팅,퍼포먼스마케팅,AD(아트디렉터),BM(브랜드매니저),세일즈프로모션,ATL,BTL,일러스트레이터,전시디자인,일러스트,경영기획,사업기획,PL(프로젝트리더),PM(프로젝트매니저),사업제휴,신사업기획,KPI관리,물류관리,자재관리,재고관리,국제물류,유통관리,SCM,3PL운영,ERP,인사,마케팅,영업,경영관리\"},\"experience-level\":{\"code\":3,\"min\":0,\"max\":0,\"name\":\"신입/경력\"},\"required-education-level\":{\"code\":\"7\",\"name\":\"대학졸업(2,3년)이상\"}},\"keyword\":\"가전·오디오판매\",\"salary\":{\"code\":\"99\",\"name\":\"면접후 결정\"},\"id\":\"50691271\",\"posting-timestamp\":\"1746755537\",\"modification-timestamp\":\"1747791911\",\"opening-timestamp\":\"1746716400\",\"expiration-timestamp\":\"1749308399\",\"close-type\":{\"code\":\"1\",\"name\":\"접수마감일\"}},\n" +
                "{\"url\":\"http://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=50439877&utm_source=job-search-api&utm_medium=api&utm_campaign=saramin-job-search-api\",\"active\":1,\"company\":{\"detail\":{\"href\":\"http://www.saramin.co.kr/zf_user/company-info/view?csn=1208755630&utm_source=job-search-api&utm_medium=api&utm_campaign=saramin-job-search-api\",\"name\":\"(주)씨앤에이논술\"}},\"position\":{\"title\":\"논술강사,국어강사,출판부,상담실 채용\",\"industry\":{\"code\":\"602\",\"name\":\"학원·어학원\"},\"location\":{\"code\":\"101010,101020,102050,102180,102400,102500,102510,103020,106060,116000\",\"name\":\"서울 &gt; 강남구,서울 &gt; 강동구,경기 &gt; 고양시 일산서구,경기 &gt; 성남시,경기 &gt; 용인시,경기 &gt; 하남시,경기 &gt; 화성시,광주 &gt; 남구,부산 &gt; 동래구,제주 &gt; 제주전체\"},\"job-type\":{\"code\":\"1,8\",\"name\":\"정규직,위촉직\"},\"job-mid-code\":{\"code\":\"2,13,3,14,4,15,5,16,8,19,21\",\"name\":\"IT개발·데이터,회계·세무·재무,총무·법무·사무,인사·노무·HRD,영업·판매·무역,미디어·문화·스포츠,마케팅·홍보·조사,디자인,기획·전략,교육,고객상담·TM\"},\"job-code\":{\"code\":\"87,88,113,322,323,335,336,337,339,342,343,344,349,353,359,364,365,366,367,368,429,433,439,790,1335,1419,1426,1432,1435,1502,1519,1637,1641,1798,1799,1809,1810,1817,1820,1821,1830,1847,1851,1852,1853,1870,1880,1881,1883,1890,1924,1972,1982,2197,2201,2220\",\"name\":\"논술학원,웹개발,웹마스터,반응형웹,경리,경리사무원,더존,4대보험,계산서발행,급여(Payroll),법인결산,법인세신고,부가세신고,세무회계,연말정산,원천세신고,재무기획,재무제표,재무회계,전표입력,종합소득세,경영지원,직업상담사,학원영업,교열,SNS마케팅,모바일마케팅,온라인마케팅,콘텐츠마케팅,웹디자인,편집디자인,웹기획,출판기획,공부방교사,과외,보조강사,상담교사,파트강사,학원강사,학원보조,방과후교사,진로상담,학습상담,학습지,학원생관리,상담센터,입시학원,중학교,초등학교,논술/글쓰기,한국어,상담원,교육상담,회계,마케팅,재무\"},\"experience-level\":{\"code\":3,\"min\":0,\"max\":0,\"name\":\"신입/경력\"},\"required-education-level\":{\"code\":\"8\",\"name\":\"대학교졸업(4년)이상\"}},\"keyword\":\"논술학원\",\"salary\":{\"code\":\"99\",\"name\":\"면접후 결정\"},\"id\":\"50439877\",\"posting-timestamp\":\"1744084934\",\"modification-timestamp\":\"1747789211\",\"opening-timestamp\":\"1744038000\",\"expiration-timestamp\":\"1749308399\",\"close-type\":{\"code\":\"1\",\"name\":\"접수마감일\"}},\n" +
                "{\"url\":\"http://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=50446902&utm_source=job-search-api&utm_medium=api&utm_campaign=saramin-job-search-api\",\"active\":1,\"company\":{\"detail\":{\"href\":\"http://www.saramin.co.kr/zf_user/company-info/view?csn=2468801772&utm_source=job-search-api&utm_medium=api&utm_campaign=saramin-job-search-api\",\"name\":\"(주)한국로보틱스\"}},\"position\":{\"title\":\"로봇제어 신입 및 경력 채용(신입 3800~)\",\"industry\":{\"code\":\"301\",\"name\":\"솔루션·SI·ERP·CRM\"},\"location\":{\"code\":\"101000,101010,102000,102060\",\"name\":\"서울 &gt; 서울전체,서울 &gt; 강남구,경기 &gt; 경기전체,경기 &gt; 과천시\"},\"job-type\":{\"code\":\"1\",\"name\":\"정규직\"},\"job-mid-code\":{\"code\":\"11,2,9\",\"name\":\"IT개발·데이터,연구·R&D,생산\"},\"job-code\":{\"code\":\"104,118,167,800,1014,1020,1022,1023,1033,1158,1203,1205,1215,1218,1224,1232,1234,1235,1237,1241,1247,1249,1253,1262,1263,1264,1265,1266,1268,1279,1309,1323,1332,1333,1334,1352,1363,1364,1366,1367,1369,1371,1395,1419,1421,1426,1432,1433,1435,1439,1443,1459,1468,1469,1504,1507,1524,1600,1614,1625,1629,1633,1648,1649,1661,1664,1676,1685,1751,1754,1755,1759,1761,1763,1764,1795,2198,2201,2202,2203,2225\",\"name\":\"인사,프로젝트 매니저,기획자,경영지원,IT개발,QA,테스터,PM,사업기획,마케팅,IT운영,인프라,솔루션 개발,ERP,CRM,영업,기술영업,생산관리,품질관리,연구개발\"},\"experience-level\":{\"code\":2,\"min\":0,\"max\":0,\"name\":\"신입\"},\"required-education-level\":{\"code\":\"7\",\"name\":\"대학졸업(2,3년)이상\"}},\"keyword\":\"로봇제어\",\"salary\":{\"code\":\"99\",\"name\":\"면접후 결정\"},\"id\":\"50446902\",\"posting-timestamp\":\"1744132047\",\"modification-timestamp\":\"1747719977\",\"opening-timestamp\":\"1744096800\",\"expiration-timestamp\":\"1749308399\",\"close-type\":{\"code\":\"1\",\"name\":\"접수마감일\"}}\n" +
                "]";

        // JSON 배열을 JsonNode로 파싱
        JsonNode rootNode = objectMapper.readTree(jsonArray);

        // 결과를 저장할 리스트
        List<JobPost> jobPosts = new ArrayList<>();

        // 각 배열 요소를 JobPost로 변환
        for (JsonNode node : rootNode) {
            JobPost jobPost = objectMapper.treeToValue(node, JobPost.class);
            jobPosts.add(jobPost);
        }

        // 검증: 갯수
        assertEquals(3, jobPosts.size());

        // 검증: 일부 값 체크
        assertEquals("50691271", jobPosts.get(0).getId());
        assertEquals("샤오미테크놀로지코리아유한책임회사", jobPosts.get(0).getCompany());

        assertEquals("50439877", jobPosts.get(1).getId());
        assertEquals("(주)씨앤에이논술", jobPosts.get(1).getCompany());

        assertEquals("50446902", jobPosts.get(2).getId());
        assertEquals("(주)한국로보틱스", jobPosts.get(2).getCompany());
    }
}
