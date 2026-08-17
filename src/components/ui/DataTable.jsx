import EmptyState from "./EmptyState";
import { cx } from "./cx";

/**
 * 노션 데이터베이스 "표" 뷰 톤의 목록 (지시서 3장).
 * 고정 헤더 행 · 행 hover 시 옅은 강조 · 얇은 1px 구분선 · 상태는 컬러 pill.
 *
 * 1차 구현은 화면마다 표를 절대좌표로 다시 그렸고(행 높이 52/51/58/50/41처럼
 * 제각각), 비어 있을 때 빈 행만 남았다. 여기서 행 피치와 빈 상태를 한 번에 정리한다.
 *
 * 4차 지시서 2장: 표를 감싸던 바깥 상자와 헤더 배경 띠를 없앴다.
 * 남은 선은 **헤더 밑줄 하나 + 행 사이 가로선**뿐이다 — 세로선은 원래 없었다.
 * 3차에서 Card를 표로 옮긴 게 오히려 격자 감각을 준 지점을 여기서 되돌린다.
 *
 * columns: [{ key, label, width?, align?, render? }]
 * rows:    [{ id, ... }]
 */
export default function DataTable({
  columns,
  rows,
  empty,
  loading = false,
  onRowClick,
  className = "",
}) {
  const isEmpty = !loading && rows.length === 0;

  return (
    <div className={cx("w-full", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={cx(
                    "px-[10px] py-[8px] text-[13px] font-semibold text-neutral-500 first:pl-0 last:pr-0",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          {!isEmpty && !loading && (
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cx(
                    "border-b border-line last:border-b-0",
                    onRowClick && "cursor-pointer",
                    "transition-colors hover:bg-neutral-50/70",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cx(
                        "px-[10px] py-[12px] align-middle text-[14px] font-medium text-neutral-700 first:pl-0 last:pr-0",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                      )}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {(isEmpty || loading) && <EmptyState loading={loading} {...empty} />}
    </div>
  );
}
