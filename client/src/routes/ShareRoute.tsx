import ShareView from '~/components/Share/ShareView';
import Meta from '~/components/Seo/Meta';

export default function ShareRoute() {
  return (
    <>
      <Meta
        title="Geteilte Unterhaltung"
        description="Öffentliche geteilte Unterhaltung."
        robots="noindex, nofollow"
        type="website"
      />
      <ShareView />
    </>
  );
}
