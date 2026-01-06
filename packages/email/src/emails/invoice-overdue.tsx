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
  daysPastDue: number;
  link: string;
  logoUrl?: string;
  companyName?: string;
}

export const InvoiceOverdueEmail = ({
  customerName = "Customer",
  teamName = "BaseOne",
  invoiceNumber = "INV-0001",
  dueDate = "2024-01-30",
  amount = "1,000.00",
  currency = "USD",
  daysPastDue = 7,
  link = "https://app.baseone.local/i/1234567890",
  logoUrl,
  companyName,
}: Props) => {
  const text = `OVERDUE: Invoice ${invoiceNumber} - ${daysPastDue} days past due`;
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
            style={{ color: "#dc2626" }}
          >
            Invoice {invoiceNumber} <br />
            is now overdue
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
            We hope this message finds you well. We wanted to bring to your 
            attention that invoice {invoiceNumber} is now {daysPastDue} days past due.
          </Text>

          <Section className="my-[20px] p-[16px] bg-red-50 border border-red-200 rounded-lg">
            <Text className="m-0 font-medium text-red-800">
              Overdue Invoice Details:
            </Text>
            <Text className="mt-[8px] mb-0 text-red-700">
              • Invoice Number: {invoiceNumber}<br />
              • Amount Due: {currency} {amount}<br />
              • Original Due Date: {dueDate}<br />
              • Days Overdue: {daysPastDue} days
            </Text>
          </Section>

          <Text
            className={themeClasses.text}
            style={{ color: lightStyles.text.color }}
          >
            <strong>Immediate Action Required:</strong> Please arrange payment 
            as soon as possible to avoid any potential late fees or service 
            interruptions.
          </Text>

          <Text
            className={themeClasses.text}
            style={{ color: lightStyles.text.color }}
          >
            If you have already submitted payment, please disregard this notice. 
            If you are experiencing any difficulties with payment or have questions 
            about this invoice, please contact us immediately so we can work 
            together to resolve this matter.
          </Text>

          <Section className="text-center mt-[50px] mb-[30px]">
            <Button href={link} variant="primary">Pay Now</Button>
          </Section>

          <Section className="text-center mb-[50px]">
            <Text style={{ color: lightStyles.mutedText.color }}>
              or contact us at {teamName} support team
            </Text>
          </Section>

          <Text
            className={`text-[12px] ${themeClasses.mutedText}`}
            style={{ color: lightStyles.mutedText.color }}
          >
            We appreciate your prompt attention to this matter and value your business.
          </Text>

          <br />
        </Container>
      </Body>
    </EmailThemeProvider>
  );
};

export default InvoiceOverdueEmail;