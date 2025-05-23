const commonFields = `
  $dealId: String
  $customerType: String
  $customerId: String
  $debtIncomeRatio: Float
  $updatedRatio: Float
  $increaseMonthlyPaymentAmount: Float

  $averageSalaryIncome: Float
  $averageBusinessIncome: Float
  $totalIncome: Float
  $incomes: [IncomeInput]

  $monthlyCostAmount: Float
  $monthlyLoanAmount: Float
  $totalPaymentAmount: Float
  $loans: [LoanInput]
`;

const commonVariables = `
  dealId: $dealId
  customerType: $customerType
  customerId: $customerId
  debtIncomeRatio: $debtIncomeRatio
  updatedRatio: $updatedRatio
  increaseMonthlyPaymentAmount: $increaseMonthlyPaymentAmount

  averageSalaryIncome: $averageSalaryIncome
  averageBusinessIncome: $averageBusinessIncome
  totalIncome: $totalIncome
  incomes: $incomes

  monthlyCostAmount: $monthlyCostAmount
  monthlyLoanAmount: $monthlyLoanAmount
  totalPaymentAmount: $totalPaymentAmount
  loans: $loans
`;

const loansResearchAdd = `
  mutation loansResearchAdd(${commonFields}) {
    loansResearchAdd(${commonVariables}) {
      _id
    }
  }
`;

const loansResearchEdit = `
  mutation loansResearchEdit($_id: String!, ${commonFields}) {
    loansResearchEdit(_id: $_id, ${commonVariables}) {
      _id
    }
  }
`;

const loansResearchRemove = `
  mutation loansResearchRemove($loanResearchIds: [String]) {
    loansResearchRemove(loanResearchIds: $loanResearchIds)
  }
`;

const loansResearchRefetch = `
  mutation loansResearchRefetch($customerId: String!, $type: String!) {
    loansResearchRefetch(customerId: $customerId, type: $type) {
      _id
    }
  }
`;

export default {
  loansResearchAdd,
  loansResearchEdit,
  loansResearchRemove,
  loansResearchRefetch,
};
