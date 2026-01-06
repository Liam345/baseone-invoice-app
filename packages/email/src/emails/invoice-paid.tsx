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
  amount: string;
  currency: string;
  paymentDate: string;
  paymentMethod?: string;
  link: string;
  logoUrl?: string;
  companyName?: string;
}

export const InvoicePaidEmail = ({
  customerName = "Customer",
  teamName = "BaseOne",
  invoiceNumber = "INV-0001",
  amount = "1,000.00",
  currency = "USD",
  paymentDate = "2024-01-30",
  paymentMethod = "Bank Transfer",
  link = "https://app.baseone.local/i/1234567890",
  logoUrl,
  companyName,
}: Props) => {
  const text = `Payment Received: Invoice ${invoiceNumber} - Thank you!`;
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
            style={{ color: "#059669" }}
          >
            Payment Received! <br />
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
            Great news! We have successfully received your payment for invoice {invoiceNumber}. 
            Thank you for your prompt payment.
          </Text>

          <Section className="my-[20px] p-[16px] bg-green-50 border border-green-200 rounded-lg">
            <Text className="m-0 font-medium text-green-800">
              Payment Details:
            </Text>
            <Text className="mt-[8px] mb-0 text-green-700">
              • Invoice Number: {invoiceNumber}<br />
              • Amount Paid: {currency} {amount}<br />
              • Payment Date: {paymentDate}<br />
              {paymentMethod && `• Payment Method: ${paymentMethod}`}
            </Text>
          </Section>

          <Text
            className={themeClasses.text}
            style={{ color: lightStyles.text.color }}
          >
            Your account has been updated and this invoice is now marked as paid. 
            You can view the updated invoice and download a receipt using the button below.
          </Text>

          <Text
            className={themeClasses.text}
            style={{ color: lightStyles.text.color }}
          >
            We appreciate your business and look forward to continuing to work with you.
          </Text>

          <Section className="text-center mt-[50px] mb-[50px]">
            <Button href={link}>View Receipt</Button>
          </Section>

          <Text
            className={`text-[12px] ${themeClasses.mutedText}`}
            style={{ color: lightStyles.mutedText.color }}
          >
            This is a confirmation email from {teamName}. Please keep this 
            email for your records.
          </Text>

          <Text
            className={`text-[12px] ${themeClasses.mutedText}`}
            style={{ color: lightStyles.mutedText.color }}
          >
            If you have any questions about this payment or need assistance, 
            please don't hesitate to contact our support team.
          </Text>

          <br />
        </Container>
      </Body>
    </EmailThemeProvider>
  );
};

export default InvoicePaidEmail;