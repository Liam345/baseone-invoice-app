import {
  Body,
  Container,
  Heading,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Logo } from "../components/logo";
import {
  Button,
  EmailThemeProvider,
  getEmailInlineStyles,
  getEmailThemeClasses,
} from "../components/theme";

interface Props {
  customerName: string;
  teamName: string;
  invoiceNumber: string;
  dueDate: string;
  amount: string;
  currency: string;
  link: string;
  logoUrl?: string;
  companyName?: string;
}

export const InvoiceReminderEmail = ({
  customerName = "Customer",
  teamName = "BaseOne",
  invoiceNumber = "INV-0001",
  dueDate = "2024-01-30",
  amount = "1,000.00",
  currency = "USD",
  link = "https://app.baseone.local/i/1234567890",
  logoUrl,
  companyName,
}: Props) => {
  const text = `Payment Reminder: Invoice ${invoiceNumber} - Due ${dueDate}`;
  const themeClasses = getEmailThemeClasses();
  const lightStyles = getEmailInlineStyles("light");

  return (
    <EmailThemeProvider preview={<Preview>{text}</Preview>}>
      <Body
        className={`my-auto mx-auto font-sans ${themeClasses.body}`}
        style={lightStyles.body}
      >
        <Container
          className={`my-[40px] mx-auto p-[20px] max-w-[600px] ${themeClasses.container}`}
          style={{
            borderStyle: "solid",
            borderWidth: 1,
            borderRadius: 8,
            borderColor: lightStyles.container.borderColor,
          }}
        >
          <Logo logoUrl={logoUrl} companyName={companyName || teamName} />
          
          <Heading
            className={`text-[21px] font-normal text-center p-0 my-[30px] mx-0 ${themeClasses.heading}`}
            style={{ color: lightStyles.text.color }}
          >
            Payment Reminder <br />
            Invoice {invoiceNumber}
          </Heading>

          <br />

          <span
            className={`font-medium ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            Hi {customerName},
          </span>
          <Text
            className={themeClasses.text}
            style={{ color: lightStyles.text.color }}
          >
            This is a friendly reminder that payment for invoice {invoiceNumber} 
            is due on {dueDate}.
          </Text>

          <Section className="my-[20px] p-[16px] bg-gray-50 rounded-lg">
            <Text className="m-0 font-medium" style={{ color: lightStyles.text.color }}>
              Invoice Details:
            </Text>
            <Text className="mt-[8px] mb-0" style={{ color: lightStyles.text.color }}>
              • Invoice Number: {invoiceNumber}<br />
              • Amount Due: {currency} {amount}<br />
              • Due Date: {dueDate}
            </Text>
          </Section>

          <Text
            className={themeClasses.text}
            style={{ color: lightStyles.text.color }}
          >
            We kindly ask you to process this payment at your earliest convenience. 
            If you have already made the payment, please disregard this reminder.
          </Text>

          <Text
            className={themeClasses.text}
            style={{ color: lightStyles.text.color }}
          >
            If you have any questions or need assistance, please don't hesitate 
            to reply to this email.
          </Text>

          <Section className="text-center mt-[50px] mb-[50px]">
            <Button href={link}>View & Pay Invoice</Button>
          </Section>

          <Text
            className={`text-[12px] ${themeClasses.mutedText}`}
            style={{ color: lightStyles.mutedText.color }}
          >
            Thank you for your business. This is an automated reminder from {teamName}.
          </Text>

          <br />
        </Container>
      </Body>
    </EmailThemeProvider>
  );
};

export default InvoiceReminderEmail;