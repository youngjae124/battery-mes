package com.battery.mes.common.response;

import java.util.List;

public class PagedResponse<T> {

    private List<T> items;
    private int page;
    private int limit;
    private long totalCount;
    private long totalPages;

    public PagedResponse() {
    }

    public PagedResponse(List<T> items, int page, int limit, long totalCount) {
        this.items = items;
        this.page = page;
        this.limit = limit;
        this.totalCount = totalCount;
        this.totalPages = limit <= 0 ? 0 : (long) Math.ceil((double) totalCount / limit);
    }

    public List<T> getItems() {
        return items;
    }

    public void setItems(List<T> items) {
        this.items = items;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }

    public long getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(long totalPages) {
        this.totalPages = totalPages;
    }
}
