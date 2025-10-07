package com.exitlog.pagination;

public class LogPagination {
	private int currentPage;        // 현재 페이지 번호
    private int listCount;          // 전체 게시글/로그 수

    private int limit = 10;         // 한 페이지에 보여지는 게시글/로그 수 (offset 기반의 limit)
    private int pageSize = 10;      // 하단 페이지 번호 목록의 개수 (예: 1 2 3 4 5 6 7 8 9 10)

    private int maxPage;            // 마지막 페이지 번호 (총 페이지 수)
    private int startPage;          // 페이지 번호 목록의 시작 번호
    private int endPage;            // 페이지 번호 목록의 끝 번호

    private int prevPage;           // '이전' 버튼 클릭 시 이동할 페이지 번호
    private int nextPage;           // '다음' 버튼 클릭 시 이동할 페이지 번호

    public LogPagination(int currentPage, int listCount) {
        this.currentPage = currentPage;
        this.listCount = listCount;
        calculate();
    }

    public LogPagination(int currentPage, int listCount, int limit, int pageSize) {
        this.currentPage = currentPage;
        this.listCount = listCount;
        this.limit = limit;
        this.pageSize = pageSize;
        calculate();
    }

    // Getter 메서드들 (생략 - 필요에 따라 추가)
    public int getCurrentPage() { return currentPage; }
    public int getListCount() { return listCount; }
    public int getLimit() { return limit; }
    public int getPageSize() { return pageSize; }
    public int getMaxPage() { return maxPage; }
    public int getStartPage() { return startPage; }
    public int getEndPage() { return endPage; }
    public int getPrevPage() { return prevPage; }
    public int getNextPage() { return nextPage; }

    // Setter 메서드들 (생략 - 필요에 따라 추가, set 시 calculate 호출)
    public void setCurrentPage(int currentPage) { this.currentPage = currentPage; calculate(); }
    public void setListCount(int listCount) { this.listCount = listCount; calculate(); }
    public void setLimit(int limit) { this.limit = limit; calculate(); }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; calculate(); }


    @Override
    public String toString() {
        return "ManagerPagination [currentPage=" + currentPage + ", listCount=" + listCount + ", limit=" + limit
                + ", pageSize=" + pageSize + ", maxPage=" + maxPage + ", startPage=" + startPage + ", endPage="
                + endPage + ", prevPage=" + prevPage + ", nextPage=" + nextPage + "]";
    }

    private void calculate() {
        maxPage = (int)Math.ceil( (double)listCount / limit );
        startPage = (currentPage - 1) / pageSize * pageSize + 1;
        endPage = pageSize - 1 + startPage;
        if(endPage > maxPage) endPage = maxPage;

        if(currentPage <= pageSize) {
            prevPage = 1;
        } else {
            prevPage = startPage - 1;
        }

        if(endPage == maxPage) {
            nextPage = maxPage; 
        } else {
            nextPage = endPage + 1;
        }
    }
}