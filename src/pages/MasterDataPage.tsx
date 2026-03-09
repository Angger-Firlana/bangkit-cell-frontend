import PageHeader from '../components/common/PageHeader';
import MasterDataPanel from '../components/settings/MasterDataPanel';

const MasterDataPage = () => {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Master Data"
        subtitle="Kelola brand, model, dan device."
      />
      <div className="max-w-5xl">
        <MasterDataPanel />
      </div>
    </div>
  );
};

export default MasterDataPage;
