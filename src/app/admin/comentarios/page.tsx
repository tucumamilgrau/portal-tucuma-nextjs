import CommentsManager from "@/components/admin/CommentsManager";

export default function AdminComentariosPage() {
  return (
    <div className="min-w-0">
      <CommentsManager initialFilter="all" title="Moderação de Comentários" />
    </div>
  );
}
