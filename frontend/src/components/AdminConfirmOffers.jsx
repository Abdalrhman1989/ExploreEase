import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css'; 
import AdminConfirmBusinessOffers from './AdminConfirmBusinessOffers';
import AdminConfirmRestaurantOffers from './AdminConfirmRestaurantOffers';
import AdminConfirmAttractionOffers from './AdminConfirmAttractionOffers'; 
import '../styles/AdminConfirmOffers.css'; 

const AdminConfirmOffers = () => {
  return (
    <div className="admin-confirm-offers">
      <h1>Admin Confirmation Panel</h1>
      <Tabs>
        <TabList>
          <Tab>Hotel Submissions</Tab>
          <Tab>Restaurant Submissions</Tab>
          <Tab>Attraction Submissions</Tab> 
        </TabList>

        <TabPanel>
          <AdminConfirmBusinessOffers />
        </TabPanel>
        <TabPanel>
          <AdminConfirmRestaurantOffers />
        </TabPanel>
        <TabPanel>
          <AdminConfirmAttractionOffers /> 
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default AdminConfirmOffers;
