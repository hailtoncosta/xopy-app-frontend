import { Link } from 'react-router-dom';
export default function MigrationPending(_props: { onBack?: () => void }) {
 return <main className="mx-auto max-w-xl p-6"><h1 className="mb-3 text-2xl font-bold">Recurso temporariamente indisponível</h1><p>Este recurso ainda precisa ser integrado e validado no novo servidor. Nenhum pedido ou pagamento será confirmado nesta tela.</p><Link to="/" className="mt-4 inline-block text-orange-600">Voltar ao início</Link></main>;
}
