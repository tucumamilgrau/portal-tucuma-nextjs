import CommentsManager from "@/components/admin/CommentsManager";

export default function AdminDenunciasPage() {
  return (
    <div className="min-w-0">
      <CommentsManager initialFilter="flagged" title="Denúncias e Comentários Sinalizados" />
    </div>
  );
}
