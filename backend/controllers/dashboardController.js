const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { isValidObjectId, Types } = require("mongoose");

//Dashboard Data
exports.getDashboardData = async (req, res) => {
    try{
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId)); //Aggregation pipelines that match on ObjectId require an actual ObjectId type, so this converts the id to that type.

        //Fetch total income and expenses
        const totalIncome = await Income.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        console.log("totalIncome", {totalIncome, userId: isValidObjectId(userId)});

        const totalExpenses = await Expense.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        //Get income transactions in the last 60 days
        const threshold60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        console.log("dashboard threshold60:", threshold60);

        // Try date OR createdAt in case some docs only have createdAt set
        const last60DaysIncomeTransactions = await Income.find({
            userId,
            $or: [
                { date: { $gte: threshold60 } },
                { createdAt: { $gte: threshold60 } }
            ]
        }).sort({ date: -1 });

        //Get total income for last 60 days
        const incomeLast60Days = last60DaysIncomeTransactions.reduce(
            (sum, transaction) => sum + (transaction.amount || 0),
            0
        );

        //Get expense transactions in the last 30 days
        const threshold30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        console.log("dashboard threshold30:", threshold30);

        const last30DaysExpenseTransactions = await Expense.find({
            userId,
            $or: [
                { date: { $gte: threshold30 } },
                { createdAt: { $gte: threshold30 } }
            ]
        }).sort({ date: -1 });

        //Get total expenses for the last 30 days
        const expensesLast30Days = last30DaysExpenseTransactions.reduce(
            (sum, transaction) => sum + (transaction.amount || 0),
            0
        );

        //Fetch last 5 transactions (income + expenses)
        const recentIncome = await Income.find({ userId })
            .sort({ date: -1 })
            .limit(5);

        const recentExpenses = await Expense.find({ userId })
            .sort({ date: -1 })
            .limit(5);

        const lastTransactions = [
            ...recentIncome.map((txn) => ({ ...txn.toObject(), type: "income" })),
            ...recentExpenses.map((txn) => ({ ...txn.toObject(), type: "expense" }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        //Final response
        res.json({
            totalBalance: 
                (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
            totalIncome: totalIncome[0]?.total || 0,
            totalExpenses: totalExpenses[0]?.total || 0,
            last30DaysExpenses: {
                total: expensesLast30Days,
                transactions: last30DaysExpenseTransactions,
            },
            last60DaysIncome: {
                total: incomeLast60Days,
                transactions: last60DaysIncomeTransactions
            },
            recentTransactions: lastTransactions
        });
    }catch(error){
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}