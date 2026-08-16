import EmptyState from "./EmptyState";
import { cx } from "./cx";

/**
 * 노션 데이터베이스 "표" 뷰 톤의 목록 (지시서 3장).
 * 고정 헤더 행 · 행 hover 시 옅은 강조 · 얇은 1px 구분선 · 상태는 컬러 pill.
 *
 * 1차 구현은 화면마다 표를 절대좌표로 다시 그렸고(행 높이 52/51/58/50/41처럼
 * 제각각), 비어 있을 때 빈 행만 남았다. 여기서 행 피치와 빈 상태를 한 번에 정리한다.
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
    <div className={cx("overflow-hidden rounded-md border border-line bg-neutral-0", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-neutral-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={cx(
                    "px-[16px] py-[10px] text-[13px] font-semibold text-neutral-500",
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
                    "transition-colors hover:bg-neutral-50",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cx(
                        "px-[16px] py-[12px] align-middle text-[14px] font-medium text-neutral-700",
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

      {(isEmpty || loading) && (
        <div className="border-t border-line">
          <EmptyState loading={loading} {...empty} />
        </div>
      )}
    </div>
  );
}
