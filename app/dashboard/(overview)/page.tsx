import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { getdata,getinvoices,fetchCardData } from '@/neon/neon';
 
export default async function Page() {
  const data = await getdata();
  const invoices = await getinvoices();
  const card = await fetchCardData();


    return <>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={card.totalPaidInvoices} type="collected" />
        <Card title="Pending" value={card.totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={card.numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={card.numberOfCustomers}
          type="customers"
        />
      </div>
    <p>Dashboard Page</p>
    <RevenueChart revenue={data}/>
    <LatestInvoices latestInvoices={invoices}/>
    </>;
    

  }
