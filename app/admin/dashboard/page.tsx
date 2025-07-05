"use client";
import { Card, CardContent } from "@/components/ui/card";
import { DateRangePicker } from "@/components/DateRangesPicker";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_ENDPOINTS } from '../../api/nunisbackend/api';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import axios from "axios";
import { DateRange } from "react-day-picker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface User {
  id: string;
  email: string;
  message: string;
}
interface Statistics {
  total_penjualan: number;
  jumlah_order: number;
  jumlah_client: number;
}

interface Transaction {
  tanggal: string;
  total: number;
}

export default function Dashboard() {
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: new Date(), to: new Date() });
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const response = await axios.get(
          API_ENDPOINTS.CONTACT,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("There was an error!", error);
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchStatistics() {
      try {
        const response = await axios.get(
          API_ENDPOINTS.STATISTICS,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        setStatistics(response.data);
      } catch (error) {
        console.error("There was an error fetching statistics!", error);
      }
    }

    fetchUsers();
    fetchStatistics();
  }, []);
  useEffect(() => {
    async function fetchTransactionsByDateRange() {
      if (!dateRange || !dateRange.from || !dateRange.to) return;
  
      try {
        const response = await axios.post(API_ENDPOINTS.TRANSAKSI_DATE_RANGE, {
          from: dateRange.from.toISOString().split('T')[0],
          to: dateRange.to.toISOString().split('T')[0],
        }, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        setTransactions(response.data);
      } catch (error) {
        console.error("There was an error fetching transactions!", error);
      }
    }
  
    fetchTransactionsByDateRange();
  }, [dateRange]);  
  // Data untuk grafik
  const chartData = {
    labels: transactions.map(transaction => transaction.tanggal),
    datasets: [{
      data: transactions.map(transaction => transaction.total),
      fill: true,
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }]
  }
  

  return (
    <div className="p-4">
      <div>
        <p className="text-sm text-gray-500">Pages / Dashboard</p>
        <h1 className="text-4xl font-semibold mt-2">Dashboard</h1>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-3 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-blue-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Penjualan</p>
              <p className="text-xl font-bold">
                {statistics
                  ? `Rp. ${statistics.total_penjualan}`
                  : "Loading..."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jumlah Order</p>
              <p className="text-xl font-bold">
                {statistics ? statistics.jumlah_order : "Loading..."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-green-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Client</p>
              <p className="text-xl font-bold">
                {statistics ? statistics.jumlah_client : "Loading..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-8">
  <div className="col-span-2">
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Dinamika Pejualan</h2>
        <Line data={chartData} />
      </CardContent>
    </Card>
  </div>
  
  <div>
    <Card>
      <CardContent className="p-0">
        <DateRangePicker className="p-2" onDateRangeChange={setDateRange} />
      </CardContent>
    </Card>
  </div>
</div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Review</h2>
          {users.map((user) => (
            <div key={user.id} className="flex items-center mb-4">
              <Avatar>
                <AvatarImage src={`https://github.com/${user}.png`} />
                <AvatarFallback>{user.email[1].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="font-semibold">{user.email}</p>
                <p className="text-sm text-gray-500">{user.message}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
