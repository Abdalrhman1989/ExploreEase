import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css'; // Import default styles or customize as needed
import AdminConfirmBusinessOffers from './AdminConfirmBusinessOffers';
import AdminConfirmRestaurantOffers from './AdminConfirmRestaurantOffers';
import AdminConfirmAttractionOffers from './AdminConfirmAttractionOffers'; // New Component
import '../styles/AdminConfirmOffers.css'; // Create this CSS file for additional styling

const AdminConfirmOffers = () => {
  return (
    <div className="admin-confirm-offers">
      <h1>Admin Confirmation Panel</h1>
      <Tabs>
        <TabList>
          <Tab>Hotel Submissions</Tab>
          <Tab>Restaurant Submissions</Tab>
          <Tab>Attraction Submissions</Tab> {/* New Tab */}
        </TabList>

        <TabPanel>
          <AdminConfirmBusinessOffers />
        </TabPanel>
        <TabPanel>
          <AdminConfirmRestaurantOffers />
        </TabPanel>
        <TabPanel>
          <AdminConfirmAttractionOffers /> {/* New Panel */}
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default AdminConfirmOffers;
