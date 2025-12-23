import pandas as pd
import random

rows = []

for borrower_id in range(1, 201):

    # Base monthly income of the borrower
    base_income = random.randint(20000, 60000)

    # EMI is kept between 20%–40% of income
    # This follows basic banking affordability rules
    emi = int(base_income * random.uniform(0.2, 0.4))

    income = base_income

    # Decide borrower type ONCE
    # normal → stable borrower
    # temporary_stress → borrower faces short-term financial trouble but later recovers
    borrower_type = random.choice(["normal", "temporary_stress"])

    for month in range(1, 25):

        # Income fluctuation: sudden income drop due to job loss / emergency
        if random.random() < 0.1:
            income *= 0.7  # 30% income drop

        # Default assumption: EMI paid on time
        paid = 1
        delay_days = 0

        # ---------- RECOVERY CASE LOGIC ----------
        # Borrower faces trouble only for a limited time (months 6–8)
        if borrower_type == "temporary_stress" and 6 <= month <= 8:
            paid = 0
            delay_days = random.randint(60, 90)

        # After month 8, borrower recovers and pays regularly
        elif borrower_type == "temporary_stress" and month > 8:
            paid = 1
            delay_days = 0

        # ---------- NORMAL PAYMENT BEHAVIOR ----------
        else:
            chance = random.random()

            if chance < 0.10:
                # Completely missed EMI
                paid = 0
                delay_days = random.randint(60, 90)

            elif chance < 0.25:
                # Late but paid EMI
                paid = 1
                delay_days = random.randint(10, 30)

        rows.append([
            borrower_id,
            month,
            int(income),
            emi,
            paid,
            delay_days
        ])

# Create DataFrame
df = pd.DataFrame(rows, columns=[
    "borrower_id", "month", "income", "emi", "paid", "delay_days"
])

# Save dataset
df.to_csv("loan_data.csv", index=False)
