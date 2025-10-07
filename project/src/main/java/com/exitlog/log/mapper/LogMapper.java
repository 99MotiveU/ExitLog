package com.exitlog.log.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.exitlog.log.model.dto.LogListItemDto;
import com.exitlog.log.model.dto.LogPostDetailDto;
import com.exitlog.log.model.dto.LogPostDto;

@Mapper
public interface LogMapper {
	LogPostDetailDto selectLog(int logNo);

	void deleteComments(int logNo);

	int deleteLog(int logNo);

	int insertLog(LogPostDetailDto log);

	void insertPostTag(int logNo, Integer tagNo);

	List<LogPostDetailDto> selectAllLogs();
	
	int getLogMyListCount(Integer userNo);
	List<LogPostDetailDto> selectPagedLogs(@Param("offset") int offset,
			@Param("limit") int limit);
	List<LogPostDetailDto> selectMyPagedLogs(@Param("userNo") int userNo,
			@Param("offset") int offset, @Param("limit") int limit);

	int editLog(LogPostDetailDto log);
	
    LogPostDto getEditLog(int logNo);

    /**
     * 모든 (삭제되지 않은) 게시글 목록을 LogListItemDto 형태로 조회 (최신순)
     * @return LogListItemDto 리스트
     */
    List<LogListItemDto> findAllLogItemsForList();


	void incrementViewCount(int logNo);


    /**
     * 페이지네이션 및 검색 조건에 맞는 (삭제되지 않은) 게시글 목록을 LogListItemDto 형태로 조회 (최신순).
     * @param offset 레코드 시작 위치
     * @param limit 가져올 레코드 수
     * @param searchType 검색 타입 (title, author, content)
     * @param keyword 검색어
     * @return LogListItemDto 리스트
     */
    List<LogListItemDto> findPagedLogItemsForList(@Param("offset") int offset,
                                                  @Param("limit") int limit,
                                                  @Param("searchType") String searchType,
                                                  @Param("keyword") String keyword);

    
    /**
     * 검색 조건에 맞는 게시글 목록의 전체 개수를 반환합니다.
     * @param searchType 검색 타입
     * @param keyword 검색어
     * @return 게시글 총 개수
     */
    int getLogListCount(@Param("searchType") String searchType,
                        @Param("keyword") String keyword);

	List<LogListItemDto> getPopularLogs();

	void deleteTag(int logNo);
}
